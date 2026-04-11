-- Enhanced Messages Schema Migration
-- Adds lead status, conversation preferences, and notification tracking

-- ============================================
-- Task 1: Add lead_status to messages table
-- ============================================
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS lead_status TEXT DEFAULT NULL 
CHECK (lead_status IN ('pending', 'accepted', 'declined'));

-- Add index for lead_status queries
CREATE INDEX IF NOT EXISTS idx_messages_lead_status ON messages(lead_status) 
WHERE lead_status IS NOT NULL;

-- ============================================
-- Task 2: Conversation preferences per user
-- ============================================
CREATE TABLE IF NOT EXISTS conversation_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  conversation_partner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  is_muted BOOLEAN DEFAULT false,
  is_archived BOOLEAN DEFAULT false,
  deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, conversation_partner_id)
);

-- Indexes for conversation preferences
CREATE INDEX IF NOT EXISTS idx_conversation_prefs_user ON conversation_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_prefs_partner ON conversation_preferences(conversation_partner_id);
CREATE INDEX IF NOT EXISTS idx_conversation_prefs_archived ON conversation_preferences(user_id, is_archived) 
WHERE is_archived = true;

-- Enable RLS on conversation_preferences
ALTER TABLE conversation_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies for conversation_preferences
DROP POLICY IF EXISTS "conversation_prefs_select_own" ON conversation_preferences;
CREATE POLICY "conversation_prefs_select_own" ON conversation_preferences
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "conversation_prefs_insert_own" ON conversation_preferences;
CREATE POLICY "conversation_prefs_insert_own" ON conversation_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "conversation_prefs_update_own" ON conversation_preferences;
CREATE POLICY "conversation_prefs_update_own" ON conversation_preferences
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "conversation_prefs_delete_own" ON conversation_preferences;
CREATE POLICY "conversation_prefs_delete_own" ON conversation_preferences
  FOR DELETE USING (auth.uid() = user_id);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_conversation_prefs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS conversation_prefs_updated_at ON conversation_preferences;
CREATE TRIGGER conversation_prefs_updated_at
  BEFORE UPDATE ON conversation_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_prefs_updated_at();

-- ============================================
-- Task 3: Message notifications tracking
-- ============================================
CREATE TABLE IF NOT EXISTS message_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  email_sent BOOLEAN DEFAULT false,
  email_sent_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  push_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for message notifications
CREATE INDEX IF NOT EXISTS idx_message_notifications_recipient ON message_notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_message_notifications_message ON message_notifications(message_id);
CREATE INDEX IF NOT EXISTS idx_message_notifications_pending ON message_notifications(recipient_id, email_sent) 
WHERE email_sent = false;

-- Enable RLS on message_notifications
ALTER TABLE message_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for message_notifications
DROP POLICY IF EXISTS "message_notifications_select_own" ON message_notifications;
CREATE POLICY "message_notifications_select_own" ON message_notifications
  FOR SELECT USING (auth.uid() = recipient_id);

DROP POLICY IF EXISTS "message_notifications_insert" ON message_notifications;
CREATE POLICY "message_notifications_insert" ON message_notifications
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "message_notifications_update_own" ON message_notifications;
CREATE POLICY "message_notifications_update_own" ON message_notifications
  FOR UPDATE USING (auth.uid() = recipient_id);

-- ============================================
-- Task 4: Update user_blocks table if not exists
-- ============================================
CREATE TABLE IF NOT EXISTS user_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  blocked_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(blocker_id, blocked_id)
);

-- Indexes for user_blocks
CREATE INDEX IF NOT EXISTS idx_user_blocks_blocker ON user_blocks(blocker_id);
CREATE INDEX IF NOT EXISTS idx_user_blocks_blocked ON user_blocks(blocked_id);

-- Enable RLS on user_blocks
ALTER TABLE user_blocks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_blocks
DROP POLICY IF EXISTS "user_blocks_select_own" ON user_blocks;
CREATE POLICY "user_blocks_select_own" ON user_blocks
  FOR SELECT USING (auth.uid() = blocker_id OR auth.uid() = blocked_id);

DROP POLICY IF EXISTS "user_blocks_insert_own" ON user_blocks;
CREATE POLICY "user_blocks_insert_own" ON user_blocks
  FOR INSERT WITH CHECK (auth.uid() = blocker_id);

DROP POLICY IF EXISTS "user_blocks_delete_own" ON user_blocks;
CREATE POLICY "user_blocks_delete_own" ON user_blocks
  FOR DELETE USING (auth.uid() = blocker_id);

-- ============================================
-- Task 5: Function to check if users are blocked
-- ============================================
CREATE OR REPLACE FUNCTION is_user_blocked(blocker_uuid UUID, blocked_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_blocks 
    WHERE blocker_id = blocker_uuid AND blocked_id = blocked_uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Task 6: Function to get conversation list with preferences
-- ============================================
CREATE OR REPLACE FUNCTION get_conversations_with_prefs(p_user_id UUID)
RETURNS TABLE (
  partner_id UUID,
  partner_name TEXT,
  partner_photo TEXT,
  last_message TEXT,
  last_message_time TIMESTAMP WITH TIME ZONE,
  unread_count BIGINT,
  is_muted BOOLEAN,
  is_archived BOOLEAN,
  lead_status TEXT
) AS $$
BEGIN
  RETURN QUERY
  WITH conversation_data AS (
    SELECT 
      CASE 
        WHEN m.sender_id = p_user_id THEN m.receiver_id 
        ELSE m.sender_id 
      END as partner_uuid,
      m.content,
      m.created_at,
      m.read,
      m.receiver_id = p_user_id as is_received,
      m.lead_status as msg_lead_status
    FROM messages m
    WHERE m.sender_id = p_user_id OR m.receiver_id = p_user_id
  ),
  partner_info AS (
    SELECT 
      cd.partner_uuid,
      u.full_name as partner_name,
      COALESCE(u.profile_photo, '/placeholder-user.jpg') as partner_photo
    FROM conversation_data cd
    JOIN users u ON u.id = cd.partner_uuid
    GROUP BY cd.partner_uuid, u.full_name, u.profile_photo
  ),
  last_messages AS (
    SELECT DISTINCT ON (partner_uuid)
      partner_uuid,
      content as last_msg,
      created_at as last_time,
      msg_lead_status as last_lead_status
    FROM conversation_data
    ORDER BY partner_uuid, created_at DESC
  ),
  unread_counts AS (
    SELECT 
      partner_uuid,
      COUNT(*) as unread
    FROM conversation_data
    WHERE is_received = true AND read = false
    GROUP BY partner_uuid
  ),
  prefs AS (
    SELECT 
      cp.conversation_partner_id as pref_partner_id,
      cp.is_muted as pref_is_muted,
      cp.is_archived as pref_is_archived
    FROM conversation_preferences cp
    WHERE cp.user_id = p_user_id
  )
  SELECT 
    pi.partner_uuid,
    pi.partner_name,
    pi.partner_photo,
    lm.last_msg,
    lm.last_time,
    COALESCE(uc.unread, 0) as unread_count,
    COALESCE(p.pref_is_muted, false) as is_muted,
    COALESCE(p.pref_is_archived, false) as is_archived,
    lm.last_lead_status as lead_status
  FROM partner_info pi
  LEFT JOIN last_messages lm ON lm.partner_uuid = pi.partner_uuid
  LEFT JOIN unread_counts uc ON uc.partner_uuid = pi.partner_uuid
  LEFT JOIN prefs p ON p.pref_partner_id = pi.partner_uuid
  WHERE NOT EXISTS (
    SELECT 1 FROM user_blocks ub 
    WHERE ub.blocker_id = p_user_id AND ub.blocked_id = pi.partner_uuid
  )
  ORDER BY lm.last_time DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Task 7: Update chat_rating calculation function
-- ============================================
CREATE OR REPLACE FUNCTION update_chat_rating(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
  total_received BIGINT;
  total_responded BIGINT;
  response_rate INTEGER;
BEGIN
  -- Count total messages received (excluding leads)
  SELECT COUNT(*) INTO total_received
  FROM messages
  WHERE receiver_id = p_user_id AND type = 'message';
  
  -- Count messages where user responded within 24 hours
  SELECT COUNT(DISTINCT m.id) INTO total_responded
  FROM messages m
  WHERE m.receiver_id = p_user_id 
    AND m.type = 'message'
    AND EXISTS (
      SELECT 1 FROM messages reply
      WHERE reply.sender_id = p_user_id
        AND reply.receiver_id = m.sender_id
        AND reply.created_at > m.created_at
        AND reply.created_at <= m.created_at + INTERVAL '24 hours'
    );
  
  -- Calculate response rate
  IF total_received > 0 THEN
    response_rate := LEAST(100, (total_responded * 100 / total_received));
  ELSE
    response_rate := 0;
  END IF;
  
  -- Update user's chat_rating
  UPDATE users
  SET chat_rating = response_rate
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
