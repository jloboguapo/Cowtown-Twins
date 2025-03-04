import dotenv from 'dotenv';
import FormData from 'form-data';
import jsdom from 'jsdom';
import Mailgun from 'mailgun.js';
import fetch from 'node-fetch';
import schedule from 'node-schedule';

dotenv.config();
const { JSDOM } = jsdom;
const mailgun = new Mailgun(FormData);
const mg = mailgun.client({
  username: 'api',
  key: process.env.API_KEY,
});
const email = process.env.EMAIL;

const callMyCowtownBoys = async () => {
  const response = await fetch(
    'https://www.cowtownskateboards.com/shoes/mens-cid-10?Start=17&viewall=1&SortBy=PriceL&Brand=Show%20All%20Brands&Size=12'
  );
  const data = await response.text();
  const dom = new JSDOM(data);

  const getDeals = priceRange =>
    Array.from(
      dom.window.document.querySelectorAll('.product-description > .price')
    )
      .filter(price => price.innerHTML.match(priceRange))
      .map(price => price.parentElement.textContent);

  const shoes = getDeals(/\n\$[0123].\.../);

  const joinedDeals =
    shoes &&
    shoes
      .map(chars => chars.replace('\n\n', '\n'))
      .map(chars => chars.replace('\n', ''))
      .join('');

  const subjectLine = `Cowtown's got ${shoes.length} ${
    shoes.length === 1 ? 'deal!' : 'deals!'
  }`;

  const msg = {
    from: email,
    to: email,
    subject: subjectLine,
    text: joinedDeals,
  };
  shoes.length && mg.messages.create(process.env.DOMAIN, msg);
};

const job = schedule.scheduleJob('* */4 * * *', () => {
  callMyCowtownBoys();
});

callMyCowtownBoys();
