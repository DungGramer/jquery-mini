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

  parents() {
    return this.map(elem =>
      elem === document ? elem : elem.parentNode
    ).filter(Boolean);
  }

  sibling() {
    var matched = [];
    var parents = this.parents();

    parents.forEach(parent =>
      [...parent.children].forEach(elem =>
        this.forEach(t => {
          if (t.nodeType === 1 && t !== elem) matched.push(elem);
        })
      )
    );

    return matched;
  }

  next() {
    return this.map(e => e.nextElementSibling).filter(e => e != null);
  }

  prev() {
    return this.map(e => e.previousElementSibling).filter(e => e != null);
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
    if(value === undefined) {
      var styles = [];
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
    var value = e || this;
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
