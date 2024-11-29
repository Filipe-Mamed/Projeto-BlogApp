const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const Usuario = require('../models/Usuario')
const bcrypt = require('bcryptjs')
const passport = require("passport")

router.get('/registro', function(req, res){
    res.render('usuarios/registro')
})


router.post('/registro', function(req, res){
    let erros = []

    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
        erros.push({text: "Nome inválido!"})
    }

    if(!req.body.email || typeof req.body.email == undefined || req.body.email == null){
        erros.push({text: "Email inválido!"})
    }

    if(!req.body.senha || typeof req.body.senha == undefined || req.body.senha == null){
        erros.push({text: "Senha inválida!"})
    }

    if(req.body.senha.length < 8){
        erros.push({text: "Senha inválida! A senha deve ter pelo menos 8 caracteres."})
    }

    if(req.body.senha != req.body.senha2){
        erros.push({text: "As senhas são diferentes, tente novamente!"})
    }

    if(erros.length > 0){
        res.render("usuarios/registro", {erros: erros})
    }else{
        Usuario.findOne({email: req.body.email}).lean().then(function(usuario){
            if(usuario){
                req.flash('error_msg', 'Já existe uma conta com este email')
                res.redirect('/usuario/registro')
            }else{
                const novoUsuario = new Usuario({
                    nome: req.body.nome,
                    email: req.body.email,
                    senha: req.body.senha
                })
                bcrypt.genSalt(10, function(erro, salt){
                    bcrypt.hash(novoUsuario.senha, salt, function(erro, hash){
                        if(erro){
                            req.flash('error_msg', 'Houve um erro durante o salvamento')
                            res.redirect('/')
                        }

                        novoUsuario.senha = hash

                        novoUsuario.save().then(function(){
                            req.flash('success_msg', 'Usuário criado com sucesso!')
                            res.redirect('/')
                        }).catch(function(err){
                            req.flash('error_msg', 'Houve um erro ao ser registrar, tente novamente!')
                            res.redirect('/')
                        })
                    })
                })
            }
        }).catch(function(err){
            req.flash('error_msg', 'Houve um erro no servidor')
            res.redirect('/')
        })
    }
})

router.get('/login', function(req, res){
    res.render(('usuarios/login'))
})


router.post('/login', function(req, res, next){
    passport.authenticate('local',{
        successRedirect: '/',
        failureRedirect: '/usuario/login',
        failureFlash: true
    })(req, res, next)
})

router.get('/sair', function(req, res){
    req.logout(function(err){
        if(err){
            return next(err)
        }
        req.flash('success_msg', 'Deslogado com sucesso!')
        res.redirect('/')
    })
})




module.exports = router