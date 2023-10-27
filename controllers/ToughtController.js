const sequelize = require("../db/conn");
const Tought = require("../models/Tought");
const User = require("../models/User");

const { Op } = require("sequelize");

module.exports = class ToughtController {
  static async showToughts(request, response) {
    //Ordenação
    let order = "DESC";
    if (request.query.order === "old") {
      order = "ASC";
    } else {
      order = "DESC";
    }

    let search = "";

    if (request.query.search) {
      search = request.query.search;
    }
    console.log(search);
    const toughtsData = await Tought.findAll({
      include: User,
      where: {
        title: { [Op.like]: `%${search}%` },
      },
      order:[["createdAt", order]],
    });

    const toughts = toughtsData.map((result) => result.get({ plain: true }));

    const toughtsQty = toughts.length
    console.log(toughts);
    return response.render("toughts/home", { toughts, search, toughtsQty }); //Mostrando um view
  }

  static async dashboard(request, response) {
    const userId = request.session.userId;

    const user = await User.findOne({
      where: {
        id: userId,
      },
      include: Tought,
      plain: true,
    });

    if (!user) {
      response.redirect("/login");
    }

    const toughts = user.Toughts.map((result) => result.dataValues);
    console.log(toughts);

    let emptyTought = false;

    if (!toughts.length === 0) {
      emptyTought = true;
    }

    return response.render("toughts/dashboard", { toughts, emptyTought });
  }

  static createTought(request, response) {
    return response.render("toughts/create");
  }

  static async createToughtSave(request, response) {
    const tought = {
      title: request.body.title,
      UserId: request.session.userId,
    };

    try {
      await Tought.create(tought);
      request.flash("message", "Pensamento criado com sucesso!");

      request.session.save(() => {
        response.redirect("/toughts/dashboard");
      });
    } catch (error) {
      console.log(`Aconteceu um erro: ${error}`);
    }
  }

  static async removeTought(request, response) {
    const id = request.body.id;
    const userId = request.session.userId;

    try {
      await Tought.destroy({ where: { id: id, UserId: userId } });
      request.flash("message", "Pensamento removido com sucesso!");

      request.session.save(() => {
        response.redirect("/toughts/dashboard");
      });
    } catch (error) {
      console.log(`erro encontrado: ${error}`);
    }
  }

  static async editTought(request, response) {
    const id = request.params.id;

    const tought = await Tought.findOne({ where: { id: id }, raw: true });

    response.render("toughts/edit", { tought });
  }

  static async editToughtSave(request, response) {
    const id = request.body.id;

    const { title } = request.body;

    try {
      const tought = await Tought.findByPk(id);

      if (!tought) {
        return response
          .status(404)
          .json({ massage: "Pensamemto não encontrado." });
      }

      tought.title = title;

      await tought.save();

      response.redirect("/toughts/dashboard");
    } catch (error) {
      console.log(error);
      return response
        .status(500)
        .json({ massage: "Erro interno no servidor!!!" });
    }
  }
};
