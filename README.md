# Inventory Web System

A modern web-based inventory management system built with Next.js and TypeScript, designed to help businesses manage their products, orders, clients, and suppliers efficiently.

## Features

### Product Management
- Track product inventory
- Manage product details (name, category, price, stock)
- Upload product images
- Monitor stock levels

### Client Management
- Store client information
- Track client orders
- Manage client status
- Store contact details and addresses

### Supplier Management
- Maintain supplier database
- Track supplier products
- Store supplier contact information
- Manage supplier relationships

### Order Processing
- Create and manage orders
- Track order status
- Calculate order totals
- Link orders to clients

### Financial Transactions
- Track incoming and outgoing transactions
- Monitor product movements
- Generate financial reports
- Link transactions to orders

## Technical Stack

- Next.js
- TypeScript
- React Context for state management
- Shadcn UI components
- Modern UI/UX design

## Data Structure

The system manages the following key entities:

- Products (id, name, category, price, stock, supplier, image)
- Clients (id, name, cpf_cnpj, contact, address, isActive)
- Suppliers (id, name, cnpj, contact, address)
- Orders (id, clientId, date, status, total)
- Transactions (id, type, date, productId, quantity, totalValue, orderId, description)

## Getting Started

1. Clone the repository
2. Install dependencies:
```bash
npm install

Run the development server:
npm run dev

Contributing
This project welcomes contributions. Please feel free to submit pull requests or open issues for any improvements.

License
MIT License

This README provides a clear overview of the project's features, technical stack, and data structure while maintaining a professional tone and including all the key information from the provided codebase context.
