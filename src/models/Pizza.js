// ============================================================
// Pizza.js — Model de Pizza (sql.js)
// ============================================================

const { ready, query, run, get } = require('../database/sqlite');

function formatarPizza(row) { // Função para formatar os dados de uma pizza
  if (!row) return null;
  return {
    _id:         row.id,
    id:          row.id,
    nome:        row.nome,
    descricao:   row.descricao,
    ingredientes: row.ingredientes,
    precos:      JSON.parse(row.precos || '{"P":0,"M":0,"G":0}'),
    disponivel:  row.disponivel === 1,
    categoria:   row.categoria,
    createdAt:   row.created_at,
    updatedAt:   row.updated_at,
  };
}

const Pizza = { // Model de Pizza

  async findAll() { // Função para encontrar todas as pizzas
    await ready;
    return query('SELECT * FROM pizzas ORDER BY categoria, nome').map(formatarPizza);
  },

  async findById(id) { // Função para encontrar uma pizza pelo ID
    await ready;
    return formatarPizza(get('SELECT * FROM pizzas WHERE id = ?', [id]));
  },

  async create({ nome, descricao = '', ingredientes, precos = {}, disponivel = true, categoria = 'tradicional' }) {     // Função para criar uma nova pizza
    await ready;
    const info = run(
      'INSERT INTO pizzas (nome, descricao, ingredientes, precos, disponivel, categoria) VALUES (?, ?, ?, ?, ?, ?)',
      [nome.trim(), descricao.trim(), ingredientes.trim(),
       JSON.stringify({ P: precos.P || 0, M: precos.M || 0, G: precos.G || 0 }),
       disponivel ? 1 : 0, categoria]
    );
    return this.findById(info.lastInsertRowid);
  },

  async update(id, { nome, descricao, ingredientes, precos, disponivel, categoria }) { // Função para atualizar uma pizza existente
    await ready;
    const atual = get('SELECT * FROM pizzas WHERE id = ?', [id]);
    if (!atual) return null;

    const precosAtuais = JSON.parse(atual.precos || '{"P":0,"M":0,"G":0}');
    const precosFinal  = precos
      ? { P: precos.P ?? precosAtuais.P, M: precos.M ?? precosAtuais.M, G: precos.G ?? precosAtuais.G }
      : precosAtuais;

    run(` // Função para atualizar uma pizza existente
      UPDATE pizzas SET
        nome         = ?,
        descricao    = ?,
        ingredientes = ?,
        precos       = ?,
        disponivel   = ?,
        categoria    = ?,
        updated_at   = datetime('now')
      WHERE id = ?
    `, [
      nome         ?? atual.nome,
      descricao    ?? atual.descricao,
      ingredientes ?? atual.ingredientes,
      JSON.stringify(precosFinal),
      disponivel   !== undefined ? (disponivel ? 1 : 0) : atual.disponivel,
      categoria    ?? atual.categoria,
      id
    ]);

    return this.findById(id); //  Retorna a pizza atualizada
  },

  async delete(id) { // Função para excluir uma pizza
    await ready;
    const info = run('DELETE FROM pizzas WHERE id = ?', [id]);
    return info.changes > 0;
  },
};

module.exports = Pizza; // Exporta o model de Pizza
