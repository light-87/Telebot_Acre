#!/bin/bash

# Telegram Acre Bot - Hostinger Setup Script
# Run this script on your Hostinger VPS to set up the bot

set -e

echo "==================================="
echo "Telegram Acre Bot - Hostinger Setup"
echo "==================================="
echo ""

# Check if running as root
if [ "$EUID" -eq 0 ]; then
  echo "Please don't run as root. Run as your regular user."
  exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
  echo "Node.js not found. Installing..."
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt install -y nodejs
  echo "Node.js installed: $(node -v)"
else
  echo "Node.js found: $(node -v)"
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
  echo "npm not found. Please install Node.js properly."
  exit 1
fi

# Install PM2 globally
echo ""
echo "Installing PM2 process manager..."
sudo npm install -g pm2

# Install project dependencies
echo ""
echo "Installing project dependencies..."
npm install

# Check for .env file
if [ ! -f ".env" ]; then
  echo ""
  echo "WARNING: .env file not found!"
  echo "Please create it from .env.example:"
  echo "  cp .env.example .env"
  echo "  nano .env"
  echo ""
  echo "Then run this script again or start manually with:"
  echo "  pm2 start index.js --name telegram-bot"
  exit 1
fi

# Check for private key
if [ ! -f "private_key.pem" ]; then
  echo ""
  echo "WARNING: private_key.pem not found!"
  echo "Please add your RSA private key file."
  echo ""
fi

# Stop existing bot if running
pm2 delete telegram-bot 2>/dev/null || true

# Start the bot
echo ""
echo "Starting bot with PM2..."
pm2 start index.js --name "telegram-bot"

# Save PM2 configuration
pm2 save

# Setup PM2 startup script
echo ""
echo "Setting up PM2 startup script..."
pm2 startup | tail -1 | bash

echo ""
echo "==================================="
echo "Setup Complete!"
echo "==================================="
echo ""
echo "Bot Status:"
pm2 status telegram-bot
echo ""
echo "Useful commands:"
echo "  pm2 logs telegram-bot  - View logs"
echo "  pm2 restart telegram-bot - Restart bot"
echo "  pm2 stop telegram-bot  - Stop bot"
echo ""
echo "Your bot is now running 24/7!"
