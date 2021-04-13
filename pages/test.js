import React from 'react';
import {FooterHelp, Link} from '@shopify/polaris';

const url = process.env.SHOPIFY_APP_URL

 const Test =() => {
    console.log(url)
    return (
      <FooterHelp>
  Learn more about{' '}
  <Link external url={url}>
    fulfilling orders
  </Link>
</FooterHelp>
    );
}


export default Test