const express = require("express");
const morgan = require("morgan");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const flash = require("connect-flash");
const { body, validationResult, check } = require("express-validator");
const {
  loadContact,
  findContact,
  addContact,
  cekDuplikat,
  deleteContact,
  updateContact,
} = require("./utils/contacts");

const app = express();

const port = 3000;
app.set("view engine", "ejs");

// menjalankan time date secara otomatis
app.use((req, res, next) => {
  console.log("Time : ", Date.now());
  next();
});
//==============built-in middleare================
// membuat static untuk mengelola folder assets
app.use(express.static("public"));
// menerima data dari form kontak dan mengolahnya
app.use(express.urlencoded({ extended: true }));
//third-party mioddleware
app.use(morgan("dev"));

// konfigurasi flash
app.use(cookieParser("secret"));
app.use(
  session({
    cookie: { maxAge: 6000 },
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);
app.use(flash());
app.get("/", (req, res) => {
  const mahasiswa = [
    {
      nama: "Farid Anwar Wahdie",
      email: "adie@gmail.com",
    },
    {
      nama: "Adelia citra",
      email: "adel@gmail.com",
    },
    {
      nama: "Intan Hest",
      email: "inhes@gmail.com",
    },
  ];
  res.render("index", { nama: "Farid Anwar Wahdie", title: "Home", mahasiswa });
});

// req (request) = yang kita kirimkan ke express, res (response) : apa yan dikirimkan express ke kita
app.get("/about", (req, res) => {
  res.render("about", { title: "About" });
});
app.get("/contact", (req, res) => {
  const contacts = loadContact();
  res.render("contact", { title: "Contacts", contacts, msg: req.flash("msg") });
});
// Form tambah kontak
app.get("/contact/add", (req, res) => {
  res.render("add-contact", { title: "Add Contacts" });
});

// menerima data kontak baru
app.post(
  "/contact",
  // validation
  [
    body("nama").custom((value) => {
      const duplikat = cekDuplikat(value);
      if (duplikat) {
        throw new Error("Nama sudah digunakan!");
      }
      return true;
    }),
    check("email").isEmail().withMessage("Email tidak valid"),
    check("noHP", "No HP tidak valid").isMobilePhone("id-ID"),
  ],

  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // return res.status(400).json({ errors: errors.array() });
      res.render("add-contact", {
        title: "Add Contacts",
        errors: errors.array(),
      });
    } else {
      // kirimkan flash message
      req.flash("msg", "Data kontak berhasil ditambahkan");
      // simpan data kontak dengan method addContact di contact.js
      addContact(req.body);
      // redirect halaman setelah data dikirim ke halaman daftar kontak
      res.redirect("/contact");
    }
  }
);

// form edit kontak
app.get("/contact/edit/:nama", (req, res) => {
  const contact = findContact(req.params.nama);
  res.render("edit-contact", { title: "Edit Contacts", contact });
});

// update data
app.post(
  "/contact/update",
  // validation
  [
    body("nama").custom((value, { req }) => {
      const duplikat = cekDuplikat(value);
      if (value !== req.body.oldNama && duplikat) {
        throw new Error("Nama sudah digunakan!");
      }
      return true;
    }),
    check("email").isEmail().withMessage("Email tidak valid"),
    check("noHP", "No HP tidak valid").isMobilePhone("id-ID"),
  ],

  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // return res.status(400).json({ errors: errors.array() });
      res.render("edit-contact", {
        title: "Edit Contacts",
        errors: errors.array(),
        contact: req.body,
      });
    } else {
      // kirimkan flash message
      req.flash("msg", "Data kontak berhasil diubah");
      // simpan data kontak dengan method addContact di contact.js
      updateContact(req.body);
      // redirect halaman setelah data dikirim ke halaman daftar kontak
      res.redirect("/contact");
    }
    res.send(req.body);
  }
);

// delete contact
app.get("/contact/delete/:nama", (req, res) => {
  const contact = findContact(req.params.nama);

  //jika kontak tidak ada
  if (!contact) {
    res.status(404);
    res.send("<h1>404</h1>");
  } else {
    req.flash("msg", "Data kontak berhasil dihapus");
    deleteContact(req.params.nama);
    res.redirect("/contact");
  }
});

// detail kontak
app.get("/contact/:nama", (req, res) => {
  const contact = findContact(req.params.nama);
  res.render("detail", { title: "Detail Contacts", contact });
});
app.get("/produk/:id/", (req, res) => {
  res.send(
    `Produk id : ${req.params.id} <br> Category : ${req.query.category}`
  );
});

// akan  selalu dijalankan.Jadi jangan taruh di bagian depan. Ini akan ditampilkan jika kode app.get diatasnya tidak ada
app.use("/", (req, res) => {
  res.status(404);
  res.send("Gak ada");
});

app.listen(port, () => {
  console.log(
    `Example app listening on port ${port} at http://localhost:${port}`
  );
});
