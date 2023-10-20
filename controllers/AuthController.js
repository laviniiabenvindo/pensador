const User = require('../models/User')

//Criptografar a senha
const bcrypt = require('bcryptjs')

module.exports = class AuthController{
  static login(request, response){
    return response.render('auth/login')
  }

  static async loginPost(request, response){
    const {email, password} = request.body

    const user = await User.findOne({where:{email:email}})

    //1º - Match User
    if(!user){
      request.flash('message','Usuário não encontrado')
      response.render('auth/login')
      return
    }

    //2º Validar a senha do usuário
    const passwordMatch = bcrypt.compareSync(password, user.password)
    if(!passwordMatch){
      request.flash('message','Senha inválida')
      response.render('auth/login')
      return
    }

    request.session.userId = user.id;

    request.flash('message','Bem vindo')

    request.session.save(()=>{
      response.redirect('/')
    })

  }

  static register(request, response){
    return response.render('auth/register')
  }

  static async registerPost(request, response){
    const {name, email, password, confirmpassword} = request.body

    //1º - Validação de senha - password math
    if(password != confirmpassword){
      request.flash('message', 'As senhas não conferem, tente novamente')
      response.render('auth/register')
      return
    }

    //2º - validação de email -
    const checkedIfExists = await User.findOne({where:{email:email}})
    if(checkedIfExists){
      request.flash('message', 'O e-mail já esta em uso!')
      response.render('auth/register')
      return
    }

    //3º - criptografia do password
    // salt = quantidade de caracteres extras na cript.
    const salt = bcrypt.genSaltSync(10)
    const hashedPassword = bcrypt.hashSync(password, salt)

    //4º - criar usuário no banco
    const user = {
      name,
      email,
      password:hashedPassword
    }

    try {
      //5º - Regra de negócio do app
      const createdUser = await User.create(user)

      request.session.userId = createdUser.id

      request.flash('message', 'Cadastro realizado com sucesso!')

      request.session.save(()=>{
        response.redirect('/')
      })
      // return

    } catch (error) {
      console.log(error)
    }


  }

  static async logout(request, response){
    request.session.destroy()
    return response.redirect('/login')
  }

}
