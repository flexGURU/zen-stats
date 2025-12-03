package pkg

import (
	"crypto/rand"
	"fmt"

	"golang.org/x/crypto/bcrypt"
)

const passwordChars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-_=+[]{}<>?"

func GenerateHashPassword(password string, cost int) (string, error) {
	hashPassword, err := bcrypt.GenerateFromPassword([]byte(password), cost)
	if err != nil {
		return "", Errorf(INTERNAL_ERROR, "failed to generate hash password: %s", err.Error())
	}

	return string(hashPassword), nil
}

func ComparePasswordAndHash(hashPass string, password string) error {
	err := bcrypt.CompareHashAndPassword([]byte(hashPass), []byte(password))
	if err != nil {
		return Errorf(AUTHENTICATION_ERROR, "invalid password")
	}

	return nil
}

func GenerateRandomPassword(length int) (string, error) {
	if length <= 0 {
		return "", fmt.Errorf("password length must be greater than 0")
	}

	bytes := make([]byte, length)
	_, err := rand.Read(bytes)
	if err != nil {
		return "", fmt.Errorf("failed to generate random bytes: %w", err)
	}

	for i := 0; i < length; i++ {
		bytes[i] = passwordChars[int(bytes[i])%len(passwordChars)]
	}

	return string(bytes), nil
}
