// index.js - Main Telegram Bot for Acre CRM Registration

require('dotenv').config();
const { Telegraf } = require('telegraf');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const { validateName, validateEmail, validatePhone, validateItems } = require('./validate');

const bot = new Telegraf(process.env.TELEGRAM_TOKEN);

// User sessions storage
const sessions = {};

// Conversation steps
const STEPS = {
  NAME: 'name',
  EMAIL: 'email',
  PHONE: 'phone',
  ITEMS: 'items',
  CONFIRM: 'confirm'
};

// Questions for each step
const QUESTIONS = {
  [STEPS.NAME]: 'Please enter your FULL NAME:',
  [STEPS.EMAIL]: 'Please enter your EMAIL:',
  [STEPS.PHONE]: 'Please enter your PHONE NUMBER (UK format):',
  [STEPS.ITEMS]: 'How many items do you need?'
};

// Validators for each step
const VALIDATORS = {
  [STEPS.NAME]: validateName,
  [STEPS.EMAIL]: validateEmail,
  [STEPS.PHONE]: validatePhone,
  [STEPS.ITEMS]: validateItems
};

// Start command - Initialize registration
bot.command('start', (ctx) => {
  sessions[ctx.from.id] = {
    currentStep: STEPS.NAME,
    data: {}
  };

  ctx.reply(
    'Welcome to Customer Registration!\n\n' +
    'I\'ll collect a few details from you.\n\n' +
    QUESTIONS[STEPS.NAME]
  );
});

// Cancel command - Reset registration
bot.command('cancel', (ctx) => {
  delete sessions[ctx.from.id];
  ctx.reply('Registration cancelled. Type /start to begin again.');
});

// Help command
bot.command('help', (ctx) => {
  ctx.reply(
    'Customer Registration Bot\n\n' +
    'Commands:\n' +
    '/start - Begin registration\n' +
    '/cancel - Cancel current registration\n' +
    '/help - Show this help message\n\n' +
    'During registration, I\'ll ask for:\n' +
    '1. Full Name\n' +
    '2. Email Address\n' +
    '3. UK Phone Number\n' +
    '4. Number of Items\n\n' +
    'After confirming your details, they will be submitted to our CRM system.'
  );
});

// Handle all text messages
bot.on('text', async (ctx) => {
  const userId = ctx.from.id;
  const session = sessions[userId];

  // No active session
  if (!session) {
    return ctx.reply('Please type /start to begin registration.');
  }

  const input = ctx.message.text;
  const currentStep = session.currentStep;

  // Handle confirmation step
  if (currentStep === STEPS.CONFIRM) {
    if (input.toLowerCase() === 'yes') {
      await handleSubmission(ctx, session);
    } else if (input.toLowerCase() === 'no') {
      delete sessions[userId];
      ctx.reply('Registration cancelled. Type /start to begin again.');
    } else {
      ctx.reply('Please reply YES to submit or NO to cancel.');
    }
    return;
  }

  // Validate current input
  const validator = VALIDATORS[currentStep];
  const validation = validator(input);

  if (!validation.valid) {
    // Invalid input - ask to re-enter
    return ctx.reply(
      `${validation.error}\n\n` +
      `Please try again:\n` +
      QUESTIONS[currentStep]
    );
  }

  // Valid input - store data
  session.data[currentStep] = validation.cleaned;

  // Move to next step
  const stepOrder = Object.values(STEPS);
  const currentIndex = stepOrder.indexOf(currentStep);
  const nextStep = stepOrder[currentIndex + 1];

  if (nextStep === STEPS.CONFIRM) {
    // Show confirmation summary
    session.currentStep = STEPS.CONFIRM;
    ctx.reply(
      'All information collected!\n\n' +
      'Your Details:\n' +
      `Name: ${session.data.name}\n` +
      `Email: ${session.data.email}\n` +
      `Phone: ${session.data.phone}\n` +
      `Items: ${session.data.items}\n\n` +
      'Is this correct?\n' +
      'Reply YES to submit or NO to cancel.'
    );
  } else {
    // Ask next question
    session.currentStep = nextStep;
    ctx.reply(`Got it!\n\n${QUESTIONS[nextStep]}`);
  }
});

// Submit data to Acre CRM
async function handleSubmission(ctx, session) {
  try {
    ctx.reply('Submitting to CRM...');

    // Generate JWT token for authentication
    const token = generateJWT();

    // Prepare payload for Acre API
    const nameParts = session.data.name.split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || firstName;

    // Send to Acre API
    const response = await axios.post(
      `${process.env.ACRE_API_URL}/acre/lead`,
      {
        first_name: firstName,
        last_name: lastName,
        email: session.data.email,
        phone: session.data.phone,
        items_count: session.data.items
      },
      {
        headers: {
          'X-API-KEY': process.env.ACRE_API_KEY,
          'Cookie': `authorization=${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Success response
    ctx.reply(
      'Success!\n\n' +
      'Your registration is complete.\n' +
      `Reference: ${response.data.id || 'N/A'}\n\n` +
      'Type /start to register another customer.'
    );

    // Clear session
    delete sessions[ctx.from.id];

  } catch (error) {
    console.error('Acre API Error:', error.response?.data || error.message);

    ctx.reply(
      'Error submitting to CRM\n\n' +
      `Error: ${error.response?.data?.message || error.message}\n\n` +
      'Please try again or contact support.'
    );
  }
}

// Generate JWT for Acre API authentication
function generateJWT() {
  const privateKey = fs.readFileSync(process.env.PRIVATE_KEY_PATH, 'utf8');

  const payload = {
    iss: `https://${process.env.YOUR_DOMAIN}/${process.env.SERVICE_ACCOUNT_NAME}`,
    sub: process.env.SERVICE_SUBJECT,
    aud: process.env.AUDIENCE,
    exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour expiry
    nbf: Math.floor(Date.now() / 1000) - 60,
    iat: Math.floor(Date.now() / 1000) - 60,
    ver: '1.0'
  };

  return jwt.sign(payload, privateKey, {
    algorithm: 'RS256',
    header: { kid: process.env.KID }
  });
}

// Launch bot
bot.launch();
console.log('Bot is running...');

// Graceful shutdown handlers
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
