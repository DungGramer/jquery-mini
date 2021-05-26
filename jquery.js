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

  css(property, value) {
    const camelProp = property.replace(/(-[a-z])/, g => {
      return g.replace('-', '').toUpperCase();
    });
    this.forEach(e => (e.style[camelProp] = value));
    return this;
  }

  hide() {
    this.map(e => e.setAttribute('hidden', ''));
    return this;
  }

  show() {
    this.map(e => e.removeAttribute('hidden'));
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
