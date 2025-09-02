import email from "infra/email.js";

import orchestrator from "tests/orchestrator";

beforeAll(async () => {
  await orchestrator.awaitForAllServices();
});

describe("infra/email.js", () => {
  test("send", async () => {
    await orchestrator.deleteAllEmails();
    await email.send({
      from: "Dinobergue <dinoberg@live.com>",
      to: "dinobergueviana@gmail.com",
      subject: "Teste de assunto",
      text: "Teste de corpo",
    });

    await email.send({
      from: "Dinobergue <dinoberg@live.com>",
      to: "dinobergueviana@gmail.com",
      subject: "Ultimo email enviado",
      text: "Corpo do ultimo email enviado",
    });

    const lastEmail = await orchestrator.getLastEmail();

    expect(lastEmail.sender).toBe("<dinoberg@live.com>");
    expect(lastEmail.recipients[0]).toBe("<dinobergueviana@gmail.com>");
    expect(lastEmail.subject).toBe("Ultimo email enviado");
    expect(lastEmail.text).toBe("Corpo do ultimo email enviado\n");
  });
});
