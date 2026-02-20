#!/bin/bash

echo "Clearing old documents..."
curl -s -X DELETE http://localhost:3000/api/documents

echo "Uploading receipt..."
curl -s -X POST http://localhost:3000/api/upload \
  -F "file=@./receipt.txt"

echo "Waiting for document to be indexed..."
sleep 3

echo "Setting judge environment..."
export OPENAI_API_KEY="local"
export OPENAI_BASE_URL="http://127.0.0.1:1234/v1"

echo "Starting eval..."
promptfoo eval --no-cache

echo "Done! Run 'promptfoo view' to see results."