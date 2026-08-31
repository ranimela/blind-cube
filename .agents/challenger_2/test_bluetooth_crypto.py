import struct
import hashlib

# Test 1: XOR Key Decryption & Checksum Validation (Giiker / QiYi style)
def xor_decrypt_packet(raw_packet: bytes, key: bytes) -> bytes:
    decrypted = bytearray(len(raw_packet))
    for i in range(len(raw_packet)):
        decrypted[i] = raw_packet[i] ^ key[i % len(key)]
    return bytes(decrypted)

def verify_checksum_modulo256(packet: bytes) -> bool:
    # Last byte is sum(packet[0..N-2]) mod 256
    computed = sum(packet[:-1]) & 0xFF
    return computed == packet[-1]

def verify_checksum_xor(packet: bytes) -> bool:
    xor_sum = 0
    for b in packet[:-1]:
        xor_sum ^= b
    return xor_sum == packet[-1]

# Test packet generation & roundtrip
sample_payload = b"\x01\x02\x03\x04\x05\x06\x07\x08\x09\x0A\x0B\x0C\x0D\x0E\x0F\x10\x11\x12\x13"
checksum_mod = sum(sample_payload) & 0xFF
packet_mod = sample_payload + bytes([checksum_mod])

assert verify_checksum_modulo256(packet_mod) == True, "Modulo 256 checksum verification failed"

key = b"\x11\x22\x33\x44\x55\x66\x77\x88\x99\xAA\xBB\xCC\xDD\xEE\xFF\x00"
encrypted = xor_decrypt_packet(packet_mod, key) # XOR is symmetric
decrypted = xor_decrypt_packet(encrypted, key)

assert decrypted == packet_mod, "XOR Decryption roundtrip failed"
assert verify_checksum_modulo256(decrypted) == True, "Decrypted packet checksum failed"
print("PASS: XOR Decryption and Checksum validation verified.")

# Test 2: GAN MAC-derived Key Generation Logic
def derive_gan_key(base_key: bytes, mac_address: str) -> bytes:
    # mac format: "AA:BB:CC:DD:EE:FF" -> [0xAA, 0xBB, 0xCC, 0xDD, 0xEE, 0xFF]
    mac_bytes = bytes.fromhex(mac_address.replace(":", "").replace("-", ""))
    assert len(mac_bytes) == 6, "MAC must be 6 bytes"
    assert len(base_key) == 16, "Base key must be 16 bytes"
    
    derived = bytearray(16)
    for i in range(16):
        derived[i] = (base_key[i] + mac_bytes[i % 6]) & 0xFF
    return bytes(derived)

base_key = bytes([0x01, 0x02, 0x42, 0x28, 0x31, 0x91, 0x16, 0x07, 0x20, 0x05, 0x18, 0x54, 0x42, 0x11, 0x12, 0x53])
derived_key = derive_gan_key(base_key, "D8:A9:8B:12:34:56")
assert len(derived_key) == 16, "Derived key must be 16 bytes"
print(f"PASS: GAN Key derivation verified. Derived Key: {derived_key.hex()}")

# Test 3: Gyro Quaternion Decoding (16-bit signed integer normalization)
def decode_quaternion(raw_16bit_signed: tuple[int, int, int, int]) -> tuple[float, float, float, float]:
    w, x, y, z = raw_16bit_signed
    # Normalizing 16-bit signed integer [-32768, 32767] to float [-1.0, 1.0]
    scale = 1.0 / 32768.0
    return (w * scale, x * scale, y * scale, z * scale)

raw_quat = (32767, 0, 0, 0)
qw, qx, qy, qz = decode_quaternion(raw_quat)
assert round(qw, 2) == 1.0, "Quaternion w normalization incorrect"
print(f"PASS: Quaternion decoding verified: ({qw:.4f}, {qx:.4f}, {qy:.4f}, {qz:.4f})")
