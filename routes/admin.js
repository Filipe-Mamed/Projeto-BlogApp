const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const Categorias = require("../models/Categoria")
const Categoria = require('../models/Categoria')
const Postagem = require('../models/Postagem')
const { ObjectId } = require('mongodb')
const {eAdmin} = require('../helpers/eAdmin')


router.get('/', eAdmin, function(req, res){
    res.render('./admin/index')
})

router.get('/posts', eAdmin, function(req, res){
    res.send('Página de posts')
})

router.get('/categorias', eAdmin, function(req, res){
    Categoria.find().sort({date:'desc'}).lean().then(function(Categorias){
        res.render('./admin/categorias', {Categorias: Categorias})
    }).catch(function(err){
        req.flash("error_msg", "Houve um erro de listar as categorias!")
        res.render('./admin')

    })
})

router.get('/categorias/add', eAdmin, function(req, res){
    res.render('./admin/addcategorias')
})

router.post('/categorias/novas', eAdmin, function(req, res){
    let erros = []

    if(!req.body.Nome || typeof req.body.Nome == undefined || req.body.Nome == null){
        erros.push({text: "Nome inválido!"})
    }

    if(!req.body.Conteúdo || typeof req.body.Conteúdo == undefined || req.body.Conteúdo == null){
        erros.push({text: "Conteúdo inválido!"})
    }

    if(erros.length > 0){
        res.render("admin/addcategorias", {erros: erros})
    }else{
        const novaCategoria ={
            nome: req.body.Nome,
            conteudo: req.body.Conteúdo
        }
    
        new Categorias(novaCategoria).save().then(function(){
            req.flash("success_msg", "Categoria adicionada com sucesso!")
            res.redirect("/admin/categorias")
        }).catch(function(err){
            req.flash("error_msg", "Erro ao adicionar categoria!")
            res.redirect("/admin")
        })
    }
})


router.get('/categorias/editar/:id', eAdmin, function(req, res){
    Categoria.findById({_id: req.params.id}).lean().then(function(categoria){
        res.render('admin/editcategorias', {categoria: categoria})
    }).catch(function(err){
        req.flash('error_msg', 'Categoria não existe')
        res.redirect('/admin/categorias')
    })
    
})

router.post('/categorias/edit', eAdmin, function(req, res){
    let erros = []
    if(!req.body.Nome || typeof req.body.Nome == undefined || req.body.Nome == null){
        erros.push({text: "Nome Obrigatório!"})
    }

    if(!req.body.Conteúdo || typeof req.body.Conteúdo == undefined || req.body.Conteúdo == null){
        erros.push({text: "Conteúdo Obrigatótio!"})
    }
    if(erros.length > 0) {
        Categoria.findById(req.body.id).lean().then(function(categoria) {
            res.render('admin/editcategorias', {categoria: categoria, erros: erros});
        }).catch(function(err) {
            req.flash('error_msg', 'Erro ao buscar categoria!');
            res.redirect('/admin/categorias');
        })
    }else{
        Categoria.findByIdAndUpdate(req.body.id, {
            nome: req.body.Nome,
            conteudo: req.body.Conteúdo
        }).then(function() {
            req.flash("success_msg", 'Alterações Feitas!');
            res.redirect('/admin/categorias');
        }).catch(function(err) {
            req.flash('error_msg', 'Erro ao fazer as alterações!');
            res.redirect('/admin/categorias');
        })

    }
})

router.post('/categoria/deletar/:id', eAdmin, function(req, res){
    Categoria.findByIdAndDelete({_id: req.body.id}).then(function(){
        console.log(req.body)
        req.flash('success_msg', 'Categoria deletada com sucesso!')
        res.redirect('/admin/categorias')
    }).catch(function(err){
        req.flash('error_msg', 'Houve um erro ao deletar a categoria!')
        res.redirect('/admin/categorias')
    })
})

router.get('/postagem', eAdmin, function(req, res){
    Postagem.find().lean().populate('categoria').sort({data:'desc'}).then(function(postagens){
        res.render('admin/postagem', {postagens: postagens})
    }).catch(function(err){
        req.flash('error_msg', 'Houve um erro ao listar as postagens')
        res.redirect('/admin')
    })
    
})

router.get('/postagens/add', eAdmin, function(req, res){
    Categoria.find().lean().sort({_id: 'desc'}).then(function(categorias){
        res.render('admin/addpostagem', {categorias: categorias})
    }).catch(function(err){
        req.flash('error_msg', 'Houve um erro ao carregar o formulário!')
        res.redirect('/admin')
    })
})


router.post('/postagens/nova', eAdmin, function(req, res){
    let erros = []
    if(!req.body.titulo || typeof req.body.titulo == undefined || req.body.titulo == null){
        erros.push({texto: "Título Obrigatório!"})
    }
    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
        erros.push({texto: "Slug Obrigatório!"})
    }
    if(!req.body.descricao || typeof req.body.descricao == undefined || req.body.descricao == null){
        erros.push({texto: "descrição Obrigatório!"})
    }
    if(!req.body.conteudo || typeof req.body.conteudo == undefined || req.body.conteudo == null){
        erros.push({texto: "Conteúdo Obrigatório!"})
    }
    if(req.body.categoria == "0"){
        erros.push({texto: 'Categoria inválida, registre uma categoria'})
    }

    if(erros.length > 0){
        res.render('admin/addpostagem', {erros: erros})
    }else{
        const novaPostagem = new Postagem({
            titulo: req.body.titulo,
            slug: req.body.slug,
            descricao: req.body.descricao,
            conteudo: req.body.conteudo,
            categoria: req.body.categoria
        })

        novaPostagem.save().then(function(){
            req.flash('success_msg', 'Postagem criada com sucesso!')
            res.redirect('/admin/postagem')
        }).catch(function(err){
            req.flash('error_msg', 'Houve um erro ao criar postagem!')
            res.redirect('/admin/postagem')
        })
    }
})

router.get('/postagens/editar/:id', eAdmin, function(req, res){
    Postagem.findById(req.params.id).lean().then(function(postagem){
        Categoria.find().lean().then(function(categorias){
            res.render('admin/editpostagem', {categorias: categorias, postagem: postagem})
        }).catch(function(err){
            req.flash('error_msg', 'Houve um erro ao listar as categorias')
            res.redirect('/admin/postagens')
        })
    }).catch(function(err){
        req.flash('error_msg', 'Houve um erro de carregar o formulário de edição')
        res.redirect('admin/postagens')
    })
})




router.post('/postagens/editar', eAdmin, function(req, res){
    let erros = []
    if(!req.body.titulo || typeof req.body.titulo == undefined || req.body.titulo == null){
        erros.push({texto: "Título Obrigatório!"})
    }
    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
        erros.push({texto: "Slug Obrigatório!"})
    }
    if(!req.body.descricao || typeof req.body.descricao == undefined || req.body.descricao == null){
        erros.push({texto: "descrição Obrigatório!"})
    }
    if(!req.body.conteudo || typeof req.body.conteudo == undefined || req.body.conteudo == null){
        erros.push({texto: "Conteúdo Obrigatório!"})
    }
    if (!mongoose.Types.ObjectId.isValid(req.body.categoria) || req.body.categoria == "0") {
        erros.push({texto: 'Categoria inválida, registre uma categoria'});
    }

    if(erros.length > 0){
        Postagem.findById(req.body.id).lean().then(function(postagem){
            res.render('admin/editpostagem', {postagem: postagem, erros: erros})
            
        }).catch(function(err) {
            req.flash('error_msg', 'Erro ao buscar postagem!')
            res.redirect('/admin/postagem')
        })
    }else{
        Postagem.findByIdAndUpdate(req.body.id, {
            titulo: req.body.titulo,
            slug: req.body.slug,
            descricao: req.body.descricao,
            conteudo: req.body.conteudo,
            categoria: req.body.categoria
        }).then(function() {
            req.flash("success_msg", 'Alterações Feitas!');
            res.redirect('/admin/postagem');
        }).catch(function(err) {
            req.flash('error_msg', 'Erro ao fazer as alterações!');
            res.redirect('/admin/postagem');
        })
    }
})


router.get('/postagens/deletar/:id', eAdmin, function(req, res){
    Postagem.findByIdAndDelete(req.params.id).then(function(){
        req.flash('success_msg', 'Postagem deletado com sucesso')
        res.redirect('/admin/postagem')
    }).catch(function(err){
        req.flash('error_msg', 'Houve um erro ao deletar postagem')
        res.redirect('/admin/postagem')
    })
})



module.exports = router