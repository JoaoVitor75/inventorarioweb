const sqlite3 = require('sqlite3').verbose();

// Cria ou conecta ao banco de dados 'meu_banco.db'
const db = new sqlite3.Database('./meu_banco.db', (err) => {
  if (err) {
    console.error("Erro ao conectar ao banco de dados", err.message);
  } else {
    console.log("Conectado ao banco de dados SQLite");
  }
});

// Cria as tabelas
db.serialize(() => {
  // Tabela Produto
  db.run(`CREATE TABLE IF NOT EXISTS Produto (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    descricao TEXT,
    preco REAL,
    quantidade INTEGER,
    imagem TEXT,
    fornecedorId INTEGER,
    FOREIGN KEY (fornecedorId) REFERENCES Fornecedor(id)
  )`);

  // Tabela Fornecedor
  db.run(`CREATE TABLE IF NOT EXISTS Fornecedor (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    cnpj TEXT,
    contato TEXT,
    endereco TEXT
  )`);

  // Tabela Cliente
  db.run(`CREATE TABLE IF NOT EXISTS Cliente (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    cpf_cnpj TEXT,
    contato TEXT,
    endereco TEXT
  )`);

  // Tabela Pedido
  db.run(`CREATE TABLE IF NOT EXISTS Pedido (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    data TEXT NOT NULL,
    clienteId INTEGER,
    status TEXT,
    total REAL,
    FOREIGN KEY (clienteId) REFERENCES Cliente(id)
  )`);

  // Tabela ItemPedido
  db.run(`CREATE TABLE IF NOT EXISTS ItemPedido (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pedidoId INTEGER,
    produtoId INTEGER,
    quantidade INTEGER,
    precoUnitario REAL,
    FOREIGN KEY (pedidoId) REFERENCES Pedido(id),
    FOREIGN KEY (produtoId) REFERENCES Produto(id)
  )`);

  // Tabela Transacao
  db.run(`CREATE TABLE IF NOT EXISTS Transacao (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    data TEXT NOT NULL,
    tipo TEXT,
    valor REAL,
    produtoId INTEGER,
    pedidoId INTEGER,
    FOREIGN KEY (produtoId) REFERENCES Produto(id),
    FOREIGN KEY (pedidoId) REFERENCES Pedido(id)
  )`);

  // Tabela Usuario
  db.run(`CREATE TABLE IF NOT EXISTS Usuario (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    senha TEXT NOT NULL
  )`);

  console.log("Tabelas criadas com sucesso!");
});

// Fecha a conexão
db.close((err) => {
  if (err) {
    console.error("Erro ao fechar o banco de dados", err.message);
  } else {
    console.log("Conexão ao banco de dados fechada");
  }
});
