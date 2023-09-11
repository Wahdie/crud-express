const fs = require("fs");

// membuat directory jika belum ada
const directoryPath = "./data";
const dataPath = "./data/contacts.json";
if (!fs.existsSync(directoryPath)) {
  fs.mkdirSync(directoryPath);
}
if (!fs.existsSync(dataPath)) {
  fs.writeFileSync(dataPath, "[]", "utf8"); // '[]' membuat array kosong yang akan diisi kontak setiap memasukkan data
}
const loadContact = () => {
  const file = fs.readFileSync("data/contacts.json", "utf8");
  const contacts = JSON.parse(file);
  return contacts;
};
//cetak detail
const findContact = (nama) => {
  const contacts = loadContact();
  const contact = contacts.find(
    (contact) => contact.nama.toLowerCase() === nama.toLowerCase()
  );
  return contact;
};
// menimpa data json dengan data baru
const saveContact = (contacts) => {
  fs.writeFileSync("data/contacts.json", JSON.stringify(contacts));
};
// menambah data
const addContact = (contact) => {
  const contacts = loadContact();
  contacts.push(contact);
  saveContact(contacts);
};

const cekDuplikat = (nama) => {
  const contacts = loadContact();
  return contacts.find((contact) => contact.nama === nama);
};

const deleteContact = (nama) => {
  const contacts = loadContact();
  const newContacts = contacts.filter((contact) => contact.nama !== nama);
  saveContact(newContacts);
};

const updateContact = (contactBaru) => {
  const contacts = loadContact();
  // hilangkan kontak yang namanya sama dengan nama lama
  const filteredContacts = contacts.filter(
    (contact) => contact.nama !== contactBaru.oldNama
  );
  //hapus oldNama, karena sudah tidak dipakai
  delete contactBaru.oldNama;
  // save data kontak baru kontak
  filteredContacts.push(contactBaru);
  saveContact(filteredContacts);
};
module.exports = {
  loadContact,
  findContact,
  addContact,
  cekDuplikat,
  deleteContact,
  updateContact,
};
