# Telegram Customer Registration Bot

A Telegram bot that collects customer information and submits it to Acre CRM.

## Features

- Collects: Name, Email, Phone (UK format), Number of Items
- Validates all inputs automatically with helpful error messages
- Sends validated data to Acre CRM via JWT-authenticated API
- 24/7 operation with PM2 process manager

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy the example environment file and fill in your credentials:

```bash
cp .env.example .env
```

Edit `.env` with your actual values:

- `TELEGRAM_TOKEN` - Get from [@BotFather](https://t.me/botfather) on Telegram
- `ACRE_API_KEY` - Your Acre CRM API key
- `ACRE_API_URL` - Acre API endpoint (default: https://api.myac.re/v1)
- JWT configuration - Get from your Acre CRM setup

### 3. Add Private Key

Place your RSA private key file in the project root as `private_key.pem`, or update `PRIVATE_KEY_PATH` in `.env`.

### 4. Run the Bot

```bash
# Development
npm run dev

# Production
npm start
```

## Deployment

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

Then add environment variables in Vercel Dashboard:
1. Go to vercel.com
2. Select your project
3. Settings > Environment Variables
4. Add all variables from `.env.example`

### Deploy to Hostinger

Run the automated setup script:

```bash
bash setup-hostinger.sh
```

Or manually:

```bash
# SSH into server
ssh user@your-server

# Upload code
scp -r ./ user@server:/home/user/telegram-bot/

# Install dependencies
cd telegram-bot && npm install

# Setup PM2
npm install -g pm2
pm2 start index.js --name "telegram-bot"
pm2 save
pm2 startup
```

## Usage

1. Find your bot on Telegram
2. Send `/start` to begin registration
3. Follow the prompts to enter:
   - Full Name
   - Email Address
   - UK Phone Number
   - Number of Items
4. Confirm your details
5. Bot submits to Acre CRM

### Commands

- `/start` - Begin registration
- `/cancel` - Cancel current registration
- `/help` - Show help message

## Validation Rules

| Field | Rules |
|-------|-------|
| Name | 2-100 characters, letters/spaces/hyphens/apostrophes only |
| Email | Valid email format (user@domain.com) |
| Phone | UK format: 07XXXXXXXXX or +447XXXXXXXXX |
| Items | Number between 1-10000 |

## Project Structure

```
telegram-acre-bot/
├── index.js           # Main bot logic
├── validate.js        # Validation functions
├── vercel.json        # Vercel deployment config
├── package.json       # Dependencies
├── .env.example       # Environment template
├── setup-hostinger.sh # Hostinger deployment script
└── README.md          # This file
```

## Troubleshooting

### Bot not responding

- Check `TELEGRAM_TOKEN` is correct
- Ensure bot is running: `pm2 status`
- Check logs: `pm2 logs telegram-bot`

### CRM submission failing

- Verify `ACRE_API_KEY` is valid
- Check private key file exists and is readable
- Ensure JWT configuration matches Acre setup
- Check API URL is correct

### Validation errors

- Phone must be UK format (starting with 07 or +447)
- Email must include @ and domain
- Name must be at least 2 characters

## License

MIT
