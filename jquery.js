class ElementCollection extends Array {
  ready(cb) {
    const isReady = this.some(e => {
      return e.readyState != null && e.readyState != 'loading';
    });
    if (isReady) {
      cb();
    } else {
      this.on('DOMContentLoaded', cb);
    }
    return this;
  }

  on(event, cbOrSelector, cb) {
    if (typeof cbOrSelector === 'function') {
      this.forEach(e => e.addEventListener(event, cbOrSelector));
    } else {
      this.forEach(elem => {
        elem.addEventListener(event, e => {
          if (e.target.matches(cbOrSelector)) cb(e);
        });
      });
    }
    return this;
  }

  children(value) {
    let newArr = [];
    this.forEach(e => {
      if (!value) {
        newArr.push(...e.children);
      } else {
        newArr.push(...e.querySelectorAll(value));
      }
    });

    // Clean current Selector
    this.length = 0;

    this.push(...newArr);
    return this;
  }

  parent() {
    return this.map(elem => elem.parentElement || elem);
  }

  parents(element) {
    this.forEach(e => {
      let curr = e;

      if (!element) {
        while (curr !== null) {
          this.push(curr);
          curr = curr.parentElement;
        }
      } else {
        this.push(document.querySelector(element));
      }
    });
    return this;
  }

  parentsUntil(element) {
    let domEl = document.querySelector(element);
    this.forEach(e => {
      let curr = e;
      if (domEl) {
        while (!curr.isSameNode(domEl)) {
          this.push(curr);
          curr = curr.parentElement;
        }
      }
    });
    return this;
  }

  sibling() {
    let matched = [];
    let parent = this.parent();

    [...parent.children].forEach(elem =>
      this.forEach(t => {
        if (t.nodeType === 1 && t !== elem) matched.push(elem);
      })
    );

    this.push(...matched);
    return this;
  }

  next() {
    return this.map(e => e.nextElementSibling).filter(e => e != null);
  }

  prev() {
    return this.map(e => e.previousElementSibling).filter(e => e != null);
  }

  nextAll() {
    let arrSibling = [];
    this.forEach(e => {
      let nextSelector = e.nextElementSibling;

      while (nextSelector !== null) {
        arrSibling.push(nextSelector);
        nextSelector = nextSelector.nextElementSibling;
      }
    });

    this.length = 0;
    this.push(...arrSibling);
    return this;
  }

  prevAll() {
    let arrSibling = [];
    this.forEach(e => {
      let prevSelector = e.previousElementSibling;

      while (prevSelector !== null) {
        arrSibling.push(prevSelector);
        prevSelector = prevSelector.previousElementSibling;
      }
    });

    this.length = 0;
    this.push(...arrSibling);
    return this;
  }

  nextUntil(value) {
    if (typeof value === 'string') {
      let arrSibling = [];

      this.forEach(e => {
        let nextSelector = e.nextElementSibling;
        this.parent().forEach(par => {
          let targetSelector = par.querySelector(value);

          try {
            if (targetSelector) {
              while (!nextSelector.isSameNode(targetSelector)) {
                arrSibling.push(nextSelector);
                nextSelector = nextSelector.nextElementSibling;
              }
            }
          } catch (e) {}
        });
      });

      this.length = 0;
      this.push(...arrSibling);
      return this;
    }
  }

  prevUntil(value) {
    if (typeof value === 'string') {
      let arrSibling = [];

      this.forEach(e => {
        let nextSelector = e.previousElementSibling;
        this.parent().forEach(par => {
          let targetSelector = par.querySelector(value);

          try {
            if (targetSelector) {
              while (!nextSelector.isSameNode(targetSelector)) {
                arrSibling.push(nextSelector);
                nextSelector = nextSelector.previousElementSibling;
              }
            }
          } catch (e) {}
        });
      });

      this.length = 0;
      this.push(...arrSibling);
      return this;
    }
  }

  removeClass(className) {
    this.forEach(e => e.classList.remove(className));
    return this;
  }

  addClass(className) {
    this.forEach(e => e.classList.add(className));
    return this;
  }

  toggleClass(className) {
    this.forEach(e => e.classList.toggle(className));
    return this;
  }

  hasClass(className) {
    return this.map(e => e.classList.contains(className)).filterOne();
  }

  css(property, value) {
    const camelProp = property.replace(/(-[a-z])/, g => {
      return g.replace('-', '').toUpperCase();
    });
    if (value === undefined) {
      let styles = [];
      this.forEach(e => styles.push(getComputedStyle(e, null)[camelProp]));
      return this.filterOne(styles);
    } else {
      this.forEach(e => (e.style[camelProp] = value));
      return this;
    }
  }

  hide() {
    this.map(e => e.setAttribute('hidden', ''));
    return this;
  }

  show() {
    this.map(e => e.removeAttribute('hidden'));
    return this;
  }

  text(value) {
    return value === undefined
      ? this.map(e => e.textContent).filterOne()
      : this.map(e => (e.textContent = value)).filterOne();
  }

  html(value) {
    return value === undefined
      ? this.map(e => e.innerHTML).filterOne()
      : this.map(e => (e.innerHTML = value)).filterOne();
  }

  val(value) {
    return value === undefined
      ? this.map(e => e.value).filterOne()
      : this.map(e => (e.value = value)).filterOne();
  }

  attr(attribute) {
    return this.map(e => e.getAttribute(attribute)).filterOne();
  }

  filterOne(e) {
    let value = e || this;
    return value.length === 1 ? value[0] : value;
  }

  append(value) {
    if (typeof value === 'string') {
      this.map(e => e.insertAdjacentHTML('beforeend', value));
    }
    return this;
  }

  after(value) {
    if (typeof value === 'string') {
      this.map(e => e.insertAdjacentHTML('afterend', value));
    }
    return this;
  }

  prepend(value) {
    if (typeof value === 'string') {
      this.map(e => e.insertAdjacentHTML('afterbegin', value));
    }
    return this;
  }

  before(value) {
    if (typeof value === 'string') {
      this.map(e => e.insertAdjacentHTML('beforebegin', value));
    }
    return this;
  }

  remove(value) {
    if (value === undefined) {
      this.map(e => e.remove());
    } else {
      this.map(elem =>
        [...elem.querySelectorAll(value)].forEach(e => e.remove())
      );
    }
    return this;
  }

  empty() {
    this.forEach(e => {
      while (e.firstChild) {
        e.removeChild(e.firstChild);
      }
    });
    return this;
  }

  innerWidth() {
    return this.map(e => e.clientWidth).filterOne();
  }

  innerHeight() {
    return this.map(e => e.clientHeight).filterOne();
  }

  outerWidth(calMargin) {
    return this.map(e => {
      let getMarginLeft = this.getCssNumber('margin-left');
      let getMarginRight = this.getCssNumber('margin-right');

      return calMargin === true
        ? e.offsetWidth + (getMarginLeft + getMarginRight)
        : e.offsetWidth;
    }).filterOne();
  }

  outerHeight() {
    return this.map(e => {
      let getMarginTop = this.getCssNumber('margin-top');
      let getMarginBottom = this.getCssNumber('margin-bottom');
      return calMargin === true
        ? e.offsetHeight + (getMarginTop + getMarginBottom)
        : e.offsetHeight;
    }).filterOne();
  }

  width() {
    return this.map(e => {
      let getPaddingLeft = this.getCssNumber('padding-left');
      let getPaddingRight = this.getCssNumber('padding-right');
      return this.innerWidth() - (getPaddingLeft + getPaddingRight);
    }).filterOne();
  }

  height() {
    return this.map(e => {
      let getPaddingTop = this.getCssNumber('padding-top');
      let getPaddingBottom = this.getCssNumber('padding-bottom');
      return this.innerWidth() - (getPaddingTop + getPaddingBottom);
    }).filterOne();
  }

  getCssNumber(property) {
    let getNumber = /[0-9]+/;
    return Number(this.css(property).match(getNumber)[0]);
  }
}

class AjaxPromise {
  constructor(promise) {
    this.promise = promise;
  }

  done(cb) {
    this.promise = this.promise.then(data => {
      cb(data);
      return data;
    });
    return this;
  }

  fail(cb) {
    this.promise = this.promise.catch(cb);
    return this;
  }

  always(cb) {
    this.promise = this.promise.finally(cb);
    return this;
  }
}

function $(param) {
  if (typeof param === 'string' || param instanceof String) {
    return new ElementCollection(...document.querySelectorAll(param));
  } else {
    return new ElementCollection(param);
  }
}

$.get = function ({ url, data = {}, success = () => {}, dataType }) {
  const queryString = Object.entries(data)
    .map(([key, value]) => `${key}=${value}`)
    .join('&');

  return new AjaxPromise(
    fetch(`${url}?${queryString}`, {
      method: 'GET',
      headers: {
        'Content-Type': dataType,
      },
    })
      .then(res => {
        if (res.ok) {
          return res.json();
        } else {
          throw new Error(res.status);
        }
      })
      .then(data => {
        success(data);
        return data;
      })
  );
};
