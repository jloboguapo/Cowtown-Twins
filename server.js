import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';
import jsdom from 'jsdom';
import isEmpty from 'lodash.isempty';
import fetch from 'node-fetch';
import schedule from 'node-schedule';

dotenv.config();
const { JSDOM } = jsdom;
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const firstApi =
  'https://www.cowtownskateboards.com/skateboarding/decks-cid-90?Start=1&Sortby=Newest&Brand=Krooked&Size=Show%20All%20Sizes';
const secondApi =
  'https://www.cowtownskateboards.com/skateboarding/decks-cid-90?Start=17&SortBy=Newest&Brand=Krooked&Size=Show%20All%20Sizes';

const callMyCowtownBoys = async api => {
  const response = await fetch(api);
  const data = await response.text();
  const dom = new JSDOM(data);

  const productNames = Array.from(
    dom.window.document.querySelectorAll('.product-shortname')
  )
    .filter(name => name.innerHTML.toLowerCase().includes('twin'))
    .map(name => name.innerHTML);

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
    subject: 'Update on Krooked Slick Twin',
    text: `Cowtown's got the  ${joinedDecks}!!!`,
  };
  !isEmpty(productNames) && sgMail.send(msg);
};

const job = schedule.scheduleJob('0 14 * * *', () => {
  callMyCowtownBoys(firstApi);
  callMyCowtownBoys(secondApi);
});
