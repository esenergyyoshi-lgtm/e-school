/* ================================================================
   高崎セラピストスクール — JavaScript
   ================================================================

   【このファイルでやっていること】
   1. ヘッダー      ：スクロールすると影がつく
   2. スティッキーCTA：ヒーローを過ぎたら画面下に表示
   3. FAQアコーディオン：クリックで開閉
   4. スクロールアニメーション：画面に入った要素をふわっと表示
   5. フォームバリデーション：送信前の入力チェック＆エラー表示

   【初心者向けメモ】
   - // から始まる行はコメントです。実行されません。
   - 変数は const（変更しない）か let（変更する）で作ります。
   - document.getElementById('id名') でHTML要素を取得します。
   - element.classList.add('クラス名') でクラスを追加します。
   ================================================================ */

'use strict'; // 安全なJSを書くためのおまじない


/* ================================================================
   ページが読み込み完了したら全ての機能を起動する
   ================================================================ */
document.addEventListener('DOMContentLoaded', function () {
  initHeader();
  initStickyCta();
  initFaq();
  initScrollAnimation();
  initContactForm();
});


/* ================================================================
   1. ヘッダー
   スクロールしたらヘッダーに影をつける
   ================================================================ */
function initHeader() {
  const header = document.getElementById('site-header');
  if (!header) return; // ヘッダーがなければ何もしない

  window.addEventListener('scroll', function () {
    if (window.scrollY > 10) {
      // 10px以上スクロールしたら影をつける
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  }, { passive: true }); // passive: true でスクロールのパフォーマンスを改善
}


/* ================================================================
   2. スティッキーCTA
   ヒーローセクションを過ぎたら画面下部のCTAを表示する
   ================================================================ */
function initStickyCta() {
  const stickyCta = document.getElementById('sticky-cta');
  const hero      = document.getElementById('top');
  if (!stickyCta || !hero) return;

  window.addEventListener('scroll', function () {
    // ヒーローセクションの下端が画面上部より上に行ったら表示
    const heroBottom = hero.getBoundingClientRect().bottom;
    if (heroBottom < 0) {
      stickyCta.classList.add('is-visible');
    } else {
      stickyCta.classList.remove('is-visible');
    }
  }, { passive: true });
}


/* ================================================================
   3. FAQアコーディオン
   質問ボタンをクリックすると回答が開閉する
   ================================================================ */
function initFaq() {
  // FAQの質問ボタンをすべて取得
  const questions = document.querySelectorAll('.faq-item__q');
  if (questions.length === 0) return;

  questions.forEach(function (question) {
    question.addEventListener('click', function () {
      // クリックされた質問に対応する回答エリアを取得
      const answer = question.nextElementSibling; // 直後の要素 = 回答
      const isOpen = question.getAttribute('aria-expanded') === 'true';

      // ---- 他のFAQをすべて閉じる ----
      questions.forEach(function (otherQ) {
        if (otherQ === question) return; // 自分自身はスキップ
        otherQ.setAttribute('aria-expanded', 'false');
        const otherA = otherQ.nextElementSibling;
        if (otherA) otherA.classList.remove('is-open');
      });

      // ---- クリックされたFAQを開閉する ----
      if (isOpen) {
        // 開いていたら閉じる
        question.setAttribute('aria-expanded', 'false');
        answer.classList.remove('is-open');
      } else {
        // 閉じていたら開く
        question.setAttribute('aria-expanded', 'true');
        answer.classList.add('is-open');
      }
    });
  });
}


/* ================================================================
   4. スクロールアニメーション
   画面に入った要素をふわっと表示する

   【しくみ】
   - 対象要素に fade-in クラスを付ける（CSSで透明＆少し下に移動した状態）
   - IntersectionObserver で「画面に入ったか」を監視する
   - 入ったら is-visible クラスを付けてアニメーション開始
   ================================================================ */
function initScrollAnimation() {
  // アニメーションさせたい要素のセレクタ一覧
  const selectors = [
    '.section__title',
    '.section__rule',
    '.empathy-list',
    '.empathy-answer',
    '.reason-card',
    '.gallery__item',
    '.teacher__photo',
    '.teacher__highlights',
    '.teacher__message',
    '.book',
    '.course-card',
    '.flow-step',
    '.voice-card',
    '.faq-item',
  ].join(', ');

  const targets = document.querySelectorAll(selectors);
  if (targets.length === 0) return;

  // 全ての対象に fade-in クラスを付ける
  targets.forEach(function (el) {
    el.classList.add('fade-in');
  });

  // IntersectionObserver：要素が画面内に入ったかを監視する
  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          // 画面に入ったら表示
          entry.target.classList.add('is-visible');
          // 一度表示したら監視を解除（パフォーマンスのため）
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold:   0.08,           // 要素の8%が見えたら発動
      rootMargin: '0px 0px -24px 0px', // 少し手前で発動
    }
  );

  targets.forEach(function (el) {
    observer.observe(el);
  });
}


/* ================================================================
   5. お問い合わせフォームのバリデーション
   送信前に入力内容を確認し、エラーがあれば赤く表示する

   【実際の送信について】
   このサンプルでは送信を止めて完了メッセージを表示します。
   本番環境では simulateFormSubmit() を実際の送信処理に差し替えてください。
   - Googleフォーム（フォームのURLを action="" に入れる）
   - Formspree（ https://formspree.io/ で無料利用可能）
   ================================================================ */
function initContactForm() {
  const form           = document.getElementById('form');
  const submitBtn      = form && form.querySelector('.form-submit');
  const successMessage = document.getElementById('form-success');
  if (!form || !submitBtn) return;

  // ---- 送信ボタンが押されたとき ----
  form.addEventListener('submit', function (event) {
    event.preventDefault(); // デフォルトの送信を止める

    const isValid = validateForm(form);
    if (!isValid) return; // バリデーションNGなら止まる

    // バリデーションOK → 送信処理へ
    submitBtn.disabled    = true;
    submitBtn.textContent = '送信中…';

    // ============================================================
    // ✏️ 本番の送信処理はここを変更してください
    //
    // 例①：Formspreeを使う場合
    //   form.action = 'https://formspree.io/f/YOUR_ID';
    //   form.submit();
    //
    // 例②：Google Apps Script（GAS）を使う場合
    //   sendToGas(form, submitBtn, successMessage);
    //
    // デモ用のシミュレーションは下記の関数を呼んでいます
    // ============================================================
    simulateFormSubmit(form, submitBtn, successMessage);
  });

  // ---- 入力中にリアルタイムでエラーを消す ----
  const inputs = form.querySelectorAll(
    '.form-group__input, .form-group__select, .form-group__textarea'
  );
  inputs.forEach(function (input) {
    input.addEventListener('input', function () {
      clearFieldError(input);
    });
  });
}


/* ================================================================
   バリデーション関数
   エラーがあれば false、なければ true を返す
   ================================================================ */
function validateForm(form) {
  let isValid = true;

  // お名前チェック（空のとき）
  const nameInput = form.querySelector('#name');
  if (nameInput && nameInput.value.trim() === '') {
    showFieldError(nameInput, 'お名前を入力してください');
    isValid = false;
  }

  // メールアドレスチェック
  const emailInput = form.querySelector('#email');
  if (emailInput) {
    if (emailInput.value.trim() === '') {
      showFieldError(emailInput, 'メールアドレスを入力してください');
      isValid = false;
    } else if (!isValidEmail(emailInput.value.trim())) {
      showFieldError(emailInput, '正しいメールアドレスを入力してください');
      isValid = false;
    }
  }

  return isValid;
}

/* エラーを表示する */
function showFieldError(input, message) {
  input.classList.add('is-error');
  const errorEl = input.closest('.form-group')?.querySelector('.form-group__error');
  if (errorEl) errorEl.textContent = message;
  input.focus(); // エラーのある欄にフォーカスを移す
}

/* エラーを消す */
function clearFieldError(input) {
  input.classList.remove('is-error');
  const errorEl = input.closest('.form-group')?.querySelector('.form-group__error');
  if (errorEl) errorEl.textContent = '';
}

/* メールアドレスの形式チェック */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}


/* ================================================================
   Netlify Forms へ fetch で送信する
   ================================================================ */
function simulateFormSubmit(form, submitBtn, successMessage) {
  var data = new FormData(form);

  fetch('/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(data).toString()
  })
  .then(function (res) {
    if (res.ok) {
      showSuccess(form, submitBtn, successMessage);
    } else {
      alert('送信に失敗しました。もう一度お試しください。');
      submitBtn.disabled = false;
      submitBtn.textContent = '送信する';
    }
  })
  .catch(function () {
    alert('通信エラーが発生しました。もう一度お試しください。');
    submitBtn.disabled = false;
    submitBtn.textContent = '送信する';
  });
}

/* 送信完了の処理 */
function showSuccess(form, submitBtn, successMessage) {
  form.reset();                        // フォームをリセット
  submitBtn.style.display = 'none';    // 送信ボタンを隠す

  if (successMessage) {
    successMessage.removeAttribute('hidden'); // 完了メッセージを表示
    // 完了メッセージが見えるようにスクロール
    successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}
