import { NotificationChannel } from "./Channel.js";

export class EmailChannel extends NotificationChannel {
  #mailer;

  constructor(mailer) {
    super();
    this.#mailer = mailer;
  }

  get name() {
    return "email";
  }

  send({ to, subject, body }) {
    return this.#mailer.send(to, subject, body);
  }
}
