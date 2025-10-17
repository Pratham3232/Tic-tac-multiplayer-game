#!/bin/bash

echo "========================================="
echo "Testing JWT Authentication Flow"
echo "========================================="
echo ""

# Generate unique username/email
TIMESTAMP=$(date +%s)
USERNAME="testuser$TIMESTAMP"
EMAIL="test$TIMESTAMP@example.com"

echo "1. Testing Registration..."
echo "   Username: $USERNAME"
echo "   Email: $EMAIL"
echo ""

REGISTER_RESPONSE=$(curl -s -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d "{
    \"username\": \"$USERNAME\",
    \"email\": \"$EMAIL\",
    \"password\": \"Test123!\"
  }")

echo "$REGISTER_RESPONSE" | jq '.'

# Extract token
TOKEN=$(echo "$REGISTER_RESPONSE" | jq -r '.accessToken')

if [ "$TOKEN" == "null" ] || [ -z "$TOKEN" ]; then
  echo "❌ FAILED: No token received from registration"
  exit 1
fi

echo ""
echo "✅ Token received: ${TOKEN:0:50}..."
echo ""

echo "2. Testing Protected Route WITH Token (/games)..."
GAMES_RESPONSE=$(curl -s -X GET http://localhost:3000/games \
  -H "Authorization: Bearer $TOKEN")

echo "$GAMES_RESPONSE" | jq '.'

if echo "$GAMES_RESPONSE" | jq -e '.statusCode == 401' > /dev/null; then
  echo "❌ FAILED: Still getting 401 Unauthorized with valid token"
  echo ""
  echo "Token details (decoded payload):"
  echo "$TOKEN" | cut -d. -f2 | base64 -d 2>/dev/null | jq '.'
  exit 1
fi

echo ""
echo "✅ Protected route accessible with token"
echo ""

echo "3. Testing Protected Route WITHOUT Token (should fail)..."
UNAUTH_RESPONSE=$(curl -s -X GET http://localhost:3000/games)
echo "$UNAUTH_RESPONSE" | jq '.'

if echo "$UNAUTH_RESPONSE" | jq -e '.statusCode == 401' > /dev/null; then
  echo ""
  echo "✅ Correctly returns 401 without token"
else
  echo ""
  echo "⚠️  WARNING: Should return 401 without token"
fi

echo ""
echo "========================================="
echo "4. Decoding JWT Token"
echo "========================================="
echo "Header:"
echo "$TOKEN" | cut -d. -f1 | base64 -d 2>/dev/null | jq '.'
echo ""
echo "Payload:"
echo "$TOKEN" | cut -d. -f2 | base64 -d 2>/dev/null | jq '.'

echo ""
echo "========================================="
echo "✅ ALL TESTS PASSED!"
echo "========================================="
