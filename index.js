// Carregando Módulos
    const express = require("express")
    const handlebars = require('express-handlebars')
    const mongoose = require("mongoose")
    const admin = require("./routes/admin")  // Rotas, vindo da pasta "routes"
    const usuario = require('./routes/usuario') // Rotas, vindo da pasta "routes"
    const path = require("path") // Esse módulo já vem embutido no npm i express
    const session = require('express-session')
    const flash = require('connect-flash')
    const moment = require('moment')
    const Postagem = require('./models/Postagem')
    const Categoria = require("./models/Categoria")
    const Usuario = require("./models/Usuario")
    const passport = require("passport")
    const Passport = require('./config/auth')(passport)
    const sessionSecret = process.env.SESSION_SECRET || "defaultSecret"
    
    
// Carregando variáveis de ambiente
    require('dotenv').config()

// Meu Servidor
    const server = express()

// Configuração

    // Sessão
        server.use(session({
            secret: sessionSecret,
            resave: true,
            saveUninitialized: true,
        }))

    // Passport Middleware
        server.use(passport.initialize())
        server.use(passport.session())
        
        server.use(flash())

    // Middleware
        server.use(function(req, res, next){
            res.locals.success_msg = req.flash("success_msg")
            res.locals.error_msg = req.flash("error_msg")
            res.locals.error = req.flash('error') // Usando na autentificação
            res.locals.user = req.user || null; // Armazena dados do usuário logado
            next()
        })


    // Requisições HTTP / Body Parser
        server.use(express.json())
        server.use(express.urlencoded({ extended: true }))
    // Handlebars
        server.engine('handlebars', handlebars.engine({defaultLayout: 'main'}))
        server.set('view engine', 'handlebars')
        partialsDir: path.join(__dirname, "views/partials")
        // Registra o auxiliar 'formatDate' que formata a data
            server.engine('handlebars', handlebars.engine({
                helpers:{
                    formatDate: function(date){
                        return moment(date).locale('pt-br').format('DD/MM/YYYY')
                    }
                }
            }))

        
    // Conexão com MongoDB usando variável de ambiente
        mongoose.connect(process.env.MONGO_URI)
        .then(function() {
            console.log('Conectado ao MongoDB')
        })
        .catch(function(err) {
            console.log('Erro ao se conectar ao MongoDB', err)
        })

    // Public
    server.use(express.static(path.join(__dirname, "/public")))


// Rotas
    server.use('/admin', admin)
    server.use('/usuario', usuario)
    
    server.get('/', function(req, res){
        Postagem.find().lean().populate('categoria').sort({data: 'desc'}).then(function(postagens){
            res.render('home', {postagens: postagens})
        }).catch(function(err){
            req.flash('error_msg', 'Houve um erro ao carregar as postagens')
            res.redirect('/404')
        })
    })

    server.get('/404', function(req, res){
        res.send('Error 404!')
    })

    server.get('/postagem/:slug', function(req, res){
        Postagem.findOne({slug: req.params.slug}).lean().then(function(postagem){
            if(postagem){
                res.render('postagem/app', {postagem: postagem})
            }else{
                req.flash('error_msg', 'Está postagem não existe')
                res.redirect('/')
            }
        }).catch(function(err){
            req.flash('error_msg', 'Houve um erro no servidor')
            res.redirect('/')
        })
    })

    server.get('/categorias', function(req, res){
        Categoria.find().lean().then(function(categorias){
            res.render('categorias/app', {categorias: categorias})
        }).catch(function(err){
            req.flash('error_msg', 'Houve um erro ao listar as categorias')
            res.redirect('/')
        })
    })

    server.get('/categorias/:conteudo', function(req, res){
        Categoria.findOne({conteudo: req.params.conteudo}).lean().then(function(categorias){
            if(categorias){
                console.log('Slug:', req.params.slug)
                Postagem.find({categoria: categorias._id}).lean().then(function(postagens){
                    res.render('categorias/postagem', {postagens: postagens, categorias: categorias})
                }).catch(function(err){
                    req.flash('error_msg', 'Houve um erro ao listar os posts')
                    res.redirect('/')
                })
            }else{
                req.flash('error_msg', 'Está categoria não existe')
                res.redirect('/')
            }
        }).catch(function(err){
            req.flash('error_msg', 'Houve um erro ao carregar a página desta categoria')
            res.redirect('/')
        })
    })



// Minha Porta
    const porta = process.env.PORT || 3000


    server.listen(porta, function(){
        console.log(`🚀 Servidor rodando em http://localhost:${porta}/`);
    })