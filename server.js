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
    'https://www.cowtownskateboards.com/skateboarding/decks-cid-90?viewall=1'
  );
  const data = await response.text();
  const dom = new JSDOM(data);

  const getProductNames = shortnames =>
    Array.from(dom.window.document.querySelectorAll('.product-shortname'))
      .filter(name => name.innerHTML.toLowerCase().includes(shortnames))
      .map(name => name.innerHTML);

  const productNamesIncludingTwin = getProductNames('twin');
  const productNamesIncludingHunny = getProductNames('hunny');

  const productNames = Array.from(
    productNamesIncludingTwin.concat(productNamesIncludingHunny)
  );

  const joinedDecks =
    productNames && productNames.length > 2
      ? [
          productNames.slice(0, -2).join(', the '),
          productNames.slice(-2).join(', and the '),
        ].join(', the ')
      : productNames && productNames.join(' and the ');

  const msg = {
    from: process.env.EMAIL,
    to: process.env.EMAIL,
    subject: 'Update on Twintails',
    text: `Cowtown's got the  ${joinedDecks}!!!`,
  };
  productNames.length && sgMail.send(msg);
};

const job = schedule.scheduleJob('0 /4 * * *', () => {
  callMyCowtownBoys();
});
