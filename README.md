# Chatbot App

This is a **customizable chatbot application** built with [Next.js](https://nextjs.org), designed to be an open and flexible solution for AI-powered chat interfaces. It supports multiple AI providers and allows users to configure their chatbot for specific needs.

## Features
- **Built with Next.js & TypeScript**
- **Customizable AI Models**: Integrate different AI models via API keys
- **User Authentication**: Uses NextAuth.js for secure authentication
- **ShadCN UI Components**: Modern and accessible UI components
- **Theming Support**: Light & Dark mode
- **Optimized Performance**: Server-side rendering (SSR) and static site generation (SSG)
- **Deployable on Vercel**

## Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/chatbot-app.git
cd chatbot-app
```

### 2. Install dependencies
```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Set up environment variables
Create a `.env.local` file and configure the required API keys:
```env
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
AI_API_KEY=your-ai-provider-key
```

### 4. Run the development server
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Customizing the Chatbot
To customize the chatbot behavior, update `utils/chat.ts` and configure API endpoints in `app/api/chat/route.ts`.

## Deployment
The easiest way to deploy your chatbot is on Vercel:
```bash
vercel deploy
```
Or configure a production `.env` file and use Docker/AWS if needed.

## Contributions
Pull requests are welcome! Feel free to fork this repository and submit improvements.

## License
MIT License

