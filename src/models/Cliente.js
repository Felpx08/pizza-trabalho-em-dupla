// ============================================================
// Cliente.js — Model de Cliente (sql.js)
// ============================================================

const { ready, query, run, get } = require('../database/sqlite'); 

function formatarCliente(row) { // Função para formatar os dados de um cliente
  if (!row) return null;
  return {
    _id:        row.id,
    id:         row.id,
    nome:       row.nome,
    telefone:   row.telefone,
    endereco:   JSON.parse(row.endereco || '{}'),
    observacoes: row.observacoes,
    ativo:      row.ativo === 1,
    createdAt:  row.created_at,
    updatedAt:  row.updated_at,
  };
}

const Cliente = { // Model de Cliente

  async findAll(busca = '') { // Função para encontrar todos os clientes
    await ready;
    let rows;
    if (busca) {
      const t = `%${busca}%`;
      rows = query(
        'SELECT * FROM clientes WHERE ativo = 1 AND (nome LIKE ? OR telefone LIKE ?) ORDER BY nome',
        [t, t]
      );
    } else {
      rows = query('SELECT * FROM clientes WHERE ativo = 1 ORDER BY nome');
    }
    return rows.map(formatarCliente);
  },

  async findById(id) { // Função para encontrar um cliente pelo ID
    await ready;
    return formatarCliente(get('SELECT * FROM clientes WHERE id = ?', [id]));
  },

  async create({ nome, telefone, endereco = {}, observacoes = '' }) { // Função para criar um novo cliente
    await ready;
    const info = run(
      'INSERT INTO clientes (nome, telefone, endereco, observacoes) VALUES (?, ?, ?, ?)',
      [nome.trim(), telefone.trim(), JSON.stringify(endereco), observacoes]
    );
    return this.findById(info.lastInsertRowid);
  },

  async update(id, { nome, telefone, endereco, observacoes, ativo }) { // Função para atualizar um cliente existente
    await ready;
    const atual = get('SELECT * FROM clientes WHERE id = ?', [id]);
    if (!atual) return null;

    const endAtual = JSON.parse(atual.endereco || '{}');
    const endFinal = endereco ? { ...endAtual, ...endereco } : endAtual;

    run(` // Função para atualizar um cliente existente
      UPDATE clientes SET
        nome        = ?,
        telefone    = ?,
        endereco    = ?,
        observacoes = ?,
        ativo       = ?,
        updated_at  = datetime('now')
      WHERE id = ?
    `, [
      nome        ?? atual.nome,
      telefone    ?? atual.telefone,
      JSON.stringify(endFinal),
      observacoes ?? atual.observacoes,
      ativo !== undefined ? (ativo ? 1 : 0) : atual.ativo,
      id
    ]);

    return this.findById(id);
  },

  async delete(id) { // Função para excluir um cliente
    await ready;
    const info = run('DELETE FROM clientes WHERE id = ?', [id]);
    return info.changes > 0;
  },
};

module.exports = Cliente; // Exporta o model de Cliente
