const User = require("../models/User");
const bcrytpt = require("bcryptjs");
const { request } = require("express");

module.exports = class AuthController {
  static async login(request, response) {
    return response.render("auth/login");
  }
  static async register(request, response) {
    return response.render("auth/register");
  }
  static async registerPost(request, response) {
    const { name, email, password, confirmpassword } = request.body;

    if (password != confirmpassword) {
      request.flash("message", "As senhas não conferem, tente novamente");
      return response.render("auth/register");
    }
    //Validação de email
    const checkIfUserExist = await User.findOne({ where: { email: email } });

    if (checkIfUserExist) {
      request.flash("message", "O email já está em uso!");
      response.render("auth/register");
      return;
    }
    //Criptografar a senha do usuario
    const salt = bcrytpt.genSaltSync(10);

    const hashedPassword = bcrytpt.hashSync(password, salt);
    //criar objeto usuario para cadastro do banco
    const user = {
      name,
      email,
      password: hashedPassword,
    };
    //try - inserir usuario no bando e trabalhar com sessão
    try {
      const createdUser = await User.create(user);
      request.session.userId = createdUser.id;
      request.flash("message", "Cadastro realizado com sucesso!");
      request.session.save(() => {
        response.redirect("/");
      });
      response.redirect("/");
    } catch (error) {
      console.log(error);
    }
  }
  static async logout(request, response) {
    request.session.destroy();
    response.redirect("/login");
  }
};
