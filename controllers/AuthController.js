const User = require("../models/User");
const bcrytpt = require("bcryptjs");

module.exports = class AuthController {
  static async login(request, response) {
    return response.render("auth/login");
  }
  static async register(request, response) {
    return response.render("auth/register");
  }
  static async registerPost(resquest, response) {
    const { name, email, password, confirmpassword } = resquest.body;

    if (password != confirmpassword) {
      resquest.flash("message", "As senhas não conferem, tente novamente");
      return response.render("auth/register");
    }
    //Validação de email
    //Criptografar a senha do usuario
    //criar objeto usuario para cadastro do banco
    //try - inserir usuario no bando e trabalhar com sessão

  }
};
