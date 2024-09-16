import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';
import jsdom from 'jsdom';
import fetch from 'node-fetch';
import schedule from 'node-schedule';

dotenv.config();
const { JSDOM } = jsdom;
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

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

  const subjectLine = `Cowtown's got ${shoes.length} deals!`;

  const msg = {
    from: process.env.EMAIL,
    to: process.env.EMAIL,
    subject: subjectLine,
    text: `${joinedDeals}`,
  };
  shoes.length && sgMail.send(msg);
  console.log(`${subjectLine}\n\n\n${joinedDeals}`);
};

const job = schedule.scheduleJob('0 1 * * *', () => {
  callMyCowtownBoys();
});
