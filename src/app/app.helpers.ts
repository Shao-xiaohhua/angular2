/*
 * Inspinia js helpers:
 *
 * correctHeight() - fix the height of main wrapper
 * detectBody() - detect windows size
 * smoothlyMenu() - add smooth fade in/out on navigation show/ide
 *
 */


import { MetaLoader } from './service/meta-loader.service';


declare var jQuery: any;

declare var CryptoJS: any;

declare var JSEncrypt: any;

declare var CertFounder: any;

export function keyEncrypt(data) {
  const rsaEncrypt = new JSEncrypt();
  rsaEncrypt.setPublicKey(MetaLoader.PUBLIC_KEY);
  const passPhrase = generateEncryptPassword(32);

  const iv = CryptoJS.lib.WordArray.random(128 / 8).toString(CryptoJS.enc.Hex);
  const salt = CryptoJS.lib.WordArray.random(128 / 8).toString(CryptoJS.enc.Hex);
  const key = CryptoJS.PBKDF2(
    passPhrase,
    CryptoJS.enc.Hex.parse(salt),
    { keySize: 128 / 32, iterations: 1000 });

  const aesEncrypted = CryptoJS.AES.encrypt(data, key, { iv: CryptoJS.enc.Hex.parse(iv) });
  const aesKey = passPhrase + ':::' + salt + ':::' + aesEncrypted.iv;
  const encryptedMessage = aesEncrypted.ciphertext.toString(CryptoJS.enc.Base64);
  const encryptedKey = rsaEncrypt.encrypt(aesKey);

  const encrypted = encryptedKey + ':::' + encryptedMessage;
  return encrypted;
};

function generateEncryptPassword(length): string {
  const encryptPassChars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz*&-%/!?*+=()';
  let randomstring = '';
  for (let i = 0; i < length; i++) {
    const rnum = Math.floor(Math.random() * encryptPassChars.length);
    randomstring += encryptPassChars.substring(rnum, rnum + 1);
  }
  return randomstring;
};

export function correctHeight() {

  const pageWrapper = jQuery('#page-wrapper');
  const navbarHeight = jQuery('nav.navbar-default').height();
  const wrapperHeight = pageWrapper.height();

  if (navbarHeight > wrapperHeight) {
    pageWrapper.css('min-height', navbarHeight + 'px');
  }

  if (navbarHeight <= wrapperHeight) {
    if (navbarHeight < jQuery(window).height()) {
      pageWrapper.css('min-height', jQuery(window).height() + 'px');
    } else {
      pageWrapper.css('min-height', navbarHeight + 'px');
    }
  }

  if (jQuery('body').hasClass('fixed-nav')) {
    if (navbarHeight > wrapperHeight) {
      pageWrapper.css('min-height', navbarHeight + 'px');
    } else {
      pageWrapper.css('min-height', jQuery(window).height() - 60 + 'px');
    }
  }
}

export function detectBody() {
  if (jQuery(document).width() < 769) {
    jQuery('body').addClass('body-small')
  } else {
    jQuery('body').removeClass('body-small')
  }
}

export function smoothlyMenu() {
  if (!jQuery('body').hasClass('mini-navbar') || jQuery('body').hasClass('body-small')) {
    // Hide menu in order to smoothly turn on when maximize menu
    jQuery('#side-menu').hide();
    // For smoothly turn on menu
    setTimeout(
      function () {
        jQuery('#side-menu').fadeIn(400);
      }, 200);
  } else if (jQuery('body').hasClass('fixed-sidebar')) {
    jQuery('#side-menu').hide();
    setTimeout(
      function () {
        jQuery('#side-menu').fadeIn(400);
      }, 100);
  } else {
    // Remove all inline style from jquery fadeIn function to reset menu state
    jQuery('#side-menu').removeAttr('style');
  }
}
