import hashlib


def calculate_hash(data):
    """
    Create a SHA-256 hash for the given data.
    """
    return hashlib.sha256(data.encode()).hexdigest()


def verify_integrity(original_hash, received_data):
    """
    Compare the original hash with the hash of received data.
    """
    received_hash = calculate_hash(received_data)

    return original_hash == received_hash


if __name__ == "__main__":

    original_message = "Emergency data from Earth to Mars"

    print("Original message:")
    print(original_message)

    original_hash = calculate_hash(original_message)

    print("\nOriginal SHA-256 hash:")
    print(original_hash)

    
    received_message = "Emergency data from Earth to Mars"

    print("\nReceived message:")
    print(received_message)

    if verify_integrity(original_hash, received_message):
        print("\nIntegrity verified ")
    else:
        print("\nIntegrity check failed ")

    
    modified_message = "Modified data from Earth to Mars"

    print("\nTesting modified message...")

    if verify_integrity(original_hash, modified_message):
        print("Integrity verified ")
    else:
        print("Integrity check failed ")