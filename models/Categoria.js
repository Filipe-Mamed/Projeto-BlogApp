const mongoose = require("mongoose")
const Schema = mongoose.Schema

const CategoriaSchema = new Schema({
    nome: {
        type: String,
        required: true
    },
    conteudo: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now()
    }
})

const Categoria = mongoose.model('Categorias', CategoriaSchema)
module.exports = Categoria