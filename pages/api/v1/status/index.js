import database from "infra/database.js";

async function status(request, response) {
  response.status(200).json({ message: "teste" });
}

export default status;
