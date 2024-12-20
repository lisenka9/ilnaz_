export class Connection {
  constructor(baseurl, group, id) {
    this.baseurl = `${baseurl}/v1/${group}/`;
    this.auth = id;
    this.baseHeader = {
      authorization: id,
    };
  }

  _getJsonHeaders() {
    return Object.assign(
      {
        "Content-Type": "application/json",
      },
      this.baseHeader
    );
  }

  fetchGet(path) {
    let fullpath = this.baseurl + path;
    return fetch(fullpath, {
      method: "GET",
      headers: this.baseHeader,
    });
  }
  fetchPost(path, body) {
    let fullpath = this.baseurl + path;
    let headers = this._getJsonHeaders();
    return fetch(fullpath, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });
  }
  fetchPatch(path, body) {
    let fullpath = this.baseurl + path;
    let headers = this._getJsonHeaders();
    return fetch(fullpath, {
      method: "PATCH",
      headers,
      body: JSON.stringify(body),
    });
  }
  fetchDelete(path) {
    let fullpath = this.baseurl + path;
    return fetch(fullpath, {
      method: "DELETE",
      headers: this.baseHeader,
    });
  }
  fetchPut(path) {
    let fullpath = this.baseurl + path;
    return fetch(fullpath, {
      method: "PUT",
      headers: this.baseHeader,
    });
  }
}
