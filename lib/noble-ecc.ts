// @ts-nocheck
import {
  Point,
  Signature,
  schnorr,
  sign as secpSign,
  verify as secpVerify,
  getPublicKey,
  hashes,
  utils,
} from "@noble/secp256k1"
import { sha256 } from "@noble/hashes/sha256"
import { hmac } from "@noble/hashes/hmac"

hashes.sha256 = sha256
hashes.hmacSha256 = (key: Uint8Array, ...messages: Uint8Array[]) => hmac(sha256, key, ...messages)

const CURVE_ORDER = BigInt("0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141")

function toBytes(input: Uint8Array) {
  return input instanceof Uint8Array ? input : new Uint8Array(input)
}

function concatBytes(...arrays: Uint8Array[]) {
  const length = arrays.reduce((sum, arr) => sum + arr.length, 0)
  const result = new Uint8Array(length)
  let offset = 0
  for (const arr of arrays) {
    result.set(arr, offset)
    offset += arr.length
  }
  return result
}

function trimLeadingZeros(bytes: Uint8Array) {
  let start = 0
  while (start < bytes.length - 1 && bytes[start] === 0) {
    start += 1
  }
  return bytes.subarray(start)
}

function derInteger(bytes: Uint8Array) {
  const trimmed = trimLeadingZeros(bytes)
  const needsPrefix = trimmed[0] >= 0x80
  const value = needsPrefix ? concatBytes(new Uint8Array([0x00]), trimmed) : trimmed
  return concatBytes(new Uint8Array([0x02, value.length]), value)
}

function toUint8Array(value: Uint8Array | ArrayLike<number>) {
  return value instanceof Uint8Array ? value : new Uint8Array(value)
}

function bytesToNumber(bytes: Uint8Array) {
  let result = 0n
  for (const byte of bytes) {
    result = (result << 8n) | BigInt(byte)
  }
  return result
}

function numberTo32Bytes(value: bigint) {
  const result = new Uint8Array(32)
  let temp = value
  for (let i = 31; i >= 0; i--) {
    result[i] = Number(temp & 0xffn)
    temp >>= 8n
  }
  return result
}

function ensurePoint(input: Uint8Array) {
  return Point.fromHex(Buffer.from(input).toString("hex"))
}

function isPoint(point: Uint8Array) {
  try {
    return utils.isValidPublicKey(toUint8Array(point))
  } catch {
    return false
  }
}

function isPrivate(privateKey: Uint8Array) {
  try {
    return utils.isValidSecretKey(toUint8Array(privateKey))
  } catch {
    return false
  }
}

function pointFromScalar(d: Uint8Array, compressed?: boolean) {
  return getPublicKey(toUint8Array(d), compressed !== false)
}

function pointCompress(p: Uint8Array, compressed?: boolean) {
  const point = ensurePoint(toUint8Array(p))
  return point.toBytes(compressed !== false)
}

function pointAdd(pA: Uint8Array, pB: Uint8Array, compressed?: boolean) {
  const a = ensurePoint(toUint8Array(pA))
  const b = ensurePoint(toUint8Array(pB))
  return a.add(b).toBytes(compressed !== false)
}

function pointAddScalar(p: Uint8Array, tweak: Uint8Array, compressed?: boolean) {
  const point = ensurePoint(toUint8Array(p))
  const tweakInt = bytesToNumber(toUint8Array(tweak))
  const tweaked = point.add(Point.BASE.multiply(tweakInt))
  return tweaked.toBytes(compressed !== false)
}

function pointMultiply(p: Uint8Array, tweak: Uint8Array, compressed?: boolean) {
  const point = ensurePoint(toUint8Array(p))
  const tweakInt = bytesToNumber(toUint8Array(tweak))
  return point.multiply(tweakInt).toBytes(compressed !== false)
}

function xOnlyPointFromScalar(d: Uint8Array) {
  const pub = pointFromScalar(d, true)
  return pub.subarray(1, 33)
}

function xOnlyPointFromPoint(p: Uint8Array) {
  const point = ensurePoint(toUint8Array(p))
  const raw = point.toBytes(true)
  return raw.subarray(1, 33)
}

function getEvenPointFromX(xonly: Uint8Array) {
  const buffer = new Uint8Array(33)
  buffer[0] = 0x02
  buffer.set(toUint8Array(xonly), 1)
  return ensurePoint(buffer)
}

function xOnlyPointAddTweak(xonlyPubkey: Uint8Array, tweak: Uint8Array) {
  try {
    const xOnly = toUint8Array(xonlyPubkey)
    const baseTweak = bytesToNumber(toUint8Array(tweak))
    const point = getEvenPointFromX(xOnly)
    const tweaked = point.add(Point.BASE.multiply(baseTweak))
    if (tweaked.equals(Point.ZERO)) return null
    const raw = tweaked.toBytes(true)
    return {
      parity: raw[0] === 3 ? 1 : 0,
      xOnlyPubkey: raw.subarray(1, 33),
    }
  } catch {
    return null
  }
}

function privateAdd(d: Uint8Array, tweak: Uint8Array) {
  const dInt = bytesToNumber(toUint8Array(d))
  const tInt = bytesToNumber(toUint8Array(tweak))
  const result = (dInt + tInt) % CURVE_ORDER
  if (result === 0n) return null
  return numberTo32Bytes(result)
}

function privateNegate(d: Uint8Array) {
  const dInt = bytesToNumber(toUint8Array(d))
  const result = (CURVE_ORDER - dInt) % CURVE_ORDER
  return numberTo32Bytes(result)
}

function sign(hash: Uint8Array, privateKey: Uint8Array, extraData?: Uint8Array) {
  const opts = extraData
    ? { extraEntropy: toUint8Array(extraData), format: "compact", prehash: false }
    : { format: "compact", prehash: false }
  return secpSign(toUint8Array(hash), toUint8Array(privateKey), opts)
}

function verify(hash: Uint8Array, publicKey: Uint8Array, signature: Uint8Array) {
  return secpVerify(toUint8Array(signature), toUint8Array(hash), toUint8Array(publicKey), {
    prehash: false,
  })
}

function signSchnorr(hash: Uint8Array, privateKey: Uint8Array, auxRand?: Uint8Array) {
  return schnorr.sign(
    toUint8Array(hash),
    toUint8Array(privateKey),
    auxRand ? toUint8Array(auxRand) : undefined
  )
}

function verifySchnorr(hash: Uint8Array, publicKey: Uint8Array, signature: Uint8Array) {
  return schnorr.verify(toUint8Array(signature), toUint8Array(hash), toUint8Array(publicKey))
}

export default {
  isPoint,
  isPrivate,
  pointFromScalar,
  pointCompress,
  pointAdd,
  pointAddScalar,
  pointMultiply,
  xOnlyPointFromScalar,
  xOnlyPointFromPoint,
  xOnlyPointAddTweak,
  privateAdd,
  privateNegate,
  sign,
  verify,
  signSchnorr,
  verifySchnorr,
}
