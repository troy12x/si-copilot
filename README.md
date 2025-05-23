# SI Copilot

This is a Next.js application that allows users to generate synthetic datasets using AI models from Venice AI. The application is designed for AI researchers and developers who need high-quality synthetic data for training and fine-tuning AI models.

## Features

- **Custom Dataset Generation**: Define your own dataset structure with custom columns and data types
- **Template-Based Output**: Create templates with variables that the AI will fill with appropriate content
- **Multiple AI Models**: Choose from various Together AI models for dataset generation
- **Customizable Sample Size**: Generate the exact number of samples you need
- **JSON Export**: Download your generated datasets as JSON files for easy integration with ML pipelines

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## How to Use

1. **Define Your Use Case**: Describe the purpose and context of your dataset
2. **Create a Template**: Design how you want your data to be structured with template variables
3. **Define Columns**: Specify the columns and data types for your dataset
4. **Add Template Variables**: Create variables that will be replaced with AI-generated content
5. **Select a Model**: Choose the AI model that best fits your use case
6. **Generate Dataset**: Click the generate button and wait for your synthetic data
7. **Download**: Save your dataset as a JSON file



## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
