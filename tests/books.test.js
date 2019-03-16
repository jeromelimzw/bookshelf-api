const request = require("supertest");
const app = require("../app");
const books = require("../static/booksData");
const route = (params = "") => {
  const path = "/api/v1/books";
  return `${path}/${params}`;
};

describe("[AUTH] checks", () => {
  test("Grants access with authorization token", () => {
    return request(app)
      .post(route())
      .set("Authorization", "Bearer my-awesome-token")
      .send({
        title: "some additional book",
        isbn: "1933988566731",
        authors: "W. Frank Ableson"
      })
      .expect(201)
      .then(res => {
        expect(res.body).toEqual({
          _id: 19,
          title: "some additional book",
          isbn: "1933988566731",
          authors: "W. Frank Ableson"
        });
      });
  });

  test("Denies access with no token", done => {
    return request(app)
      .post(route())
      .send({
        title: "some additional book",
        isbn: "1933988566731",
        authors: "W. Frank Ableson"
      })
      .expect(403, done);
  });

  test("Denies access with invalid token", done => {
    return request(app)
      .post(route())
      .set("Authorization", "Bearer my-non-awesome-token")
      .send({
        title: "some additional book",
        isbn: "1933988566731",
        authors: "W. Frank Ableson"
      })
      .expect(403, done);
  });
});

describe("[GET] Requests", () => {
  test("Returns all books when no query params given", () => {
    return request(app)
      .get(route())
      .expect(200)
      .expect(books);
  });

  test("Returns 1 book when filtered by title", () => {
    return request(app)
      .get(route())
      .query({ title: "unl" })
      .expect(200)
      .expect([
        {
          _id: 1,
          title: "Unlocking Android",
          isbn: "1933988673",
          authors: "W. Frank Ableson"
        }
      ]);
  });

  test("Returns 2 books when filtered by authors", () => {
    return request(app)
      .get(route())
      .query({ authors: "bar" })
      .expect(200)
      .expect([
        {
          _id: 18,
          title: "Distributed Application Development with PowerBuilder 6.0",
          isbn: "1884777686",
          authors: "Michael J. Barlotta"
        },
        {
          _id: 12,
          title: "Jaguar Development with PowerBuilder 7",
          isbn: "1884777864",
          authors: "Michael Barlotta"
        }
      ]);
  });

  test("Returns 3 books when filtered by authors and title", () => {
    return request(app)
      .get(route())
      .query({ authors: "bar", title: "unl" })
      .expect(200)
      .expect([
        {
          _id: 1,
          title: "Unlocking Android",
          isbn: "1933988673",
          authors: "W. Frank Ableson"
        },
        {
          _id: 18,
          title: "Distributed Application Development with PowerBuilder 6.0",
          isbn: "1884777686",
          authors: "Michael J. Barlotta"
        },
        {
          _id: 12,
          title: "Jaguar Development with PowerBuilder 7",
          isbn: "1884777864",
          authors: "Michael Barlotta"
        }
      ]);
  });

  test("Returns 1 book when searching by id", () => {
    const id = 18;
    return request(app)
      .get(route(id))
      .expect(200)
      .expect({
        _id: 18,
        title: "Distributed Application Development with PowerBuilder 6.0",
        isbn: "1884777686",
        authors: "Michael J. Barlotta"
      });
  });

  test("Returns error when searching for non-existent book by id", done => {
    const id = 50;
    return request(app)
      .get(route(id))
      .expect(404, done);
  });
});

describe("[POST] Requests", () => {
  test("Adds 1 book to list", () => {
    return request(app)
      .post(route())
      .set("Authorization", "Bearer my-awesome-token")
      .send({
        title: "some additional book",
        isbn: "1933988566732",
        authors: "W. Frank Ableson"
      })
      .expect(201)
      .then(res => {
        expect(res.body).toEqual({
          _id: 20,
          title: "some additional book",
          isbn: "1933988566732",
          authors: "W. Frank Ableson"
        });
      });
  });

  test("Denies adding book to list if ISBN exists in list", done => {
    return request(app)
      .post(route())
      .set("Authorization", "Bearer my-awesome-token")
      .send({
        title: "some additional book",
        isbn: "1933988566731",
        authors: "W. Frank Ableson"
      })
      .expect(400, done);
  });

  test("Denies adding book to list if no title", done => {
    return request(app)
      .post(route())
      .set("Authorization", "Bearer my-awesome-token")
      .send({
        isbn: "1933928566731",
        authors: "W. Frank Ableson"
      })
      .expect(400, done);
  });

  test("Denies adding book to list if no author", done => {
    return request(app)
      .post(route())
      .set("Authorization", "Bearer my-awesome-token")
      .send({
        title: "some book",
        isbn: "1933988536731"
      })
      .expect(/"authors" is required/)
      .expect(400, done);
  });

  test("Denies adding book to list if no ISBN", done => {
    return request(app)
      .post(route())
      .set("Authorization", "Bearer my-awesome-token")
      .send({
        authors: "some author",
        title: "some book"
      })
      .expect(/"isbn" is required/)
      .expect(400, done);
  });

  test("Denies adding book to list if ISBN is not an integer", done => {
    return request(app)
      .post(route())
      .set("Authorization", "Bearer my-awesome-token")
      .send({
        authors: "some author",
        title: "some book",
        isbn: "a string"
      })
      .expect(/"isbn" must be a number/)
      .expect(400, done);
  });

  test("Denies adding book to list if ISBN fewer than 13 chars", done => {
    return request(app)
      .post(route())
      .set("Authorization", "Bearer my-awesome-token")
      .send({
        authors: "some author",
        title: "some book",
        isbn: "193398853"
      })
      .expect(400, done);
  });
});

describe("[DELETE] Requests", () => {
  test("Deletes book by id", () => {
    const id = 19;
    return request(app)
      .delete(route(id))
      .set("Authorization", "Bearer my-awesome-token")
      .expect(200)
      .then(res => {
        expect(res.body).toEqual({
          _id: 19,
          title: "some additional book",
          isbn: "1933988566731",
          authors: "W. Frank Ableson"
        });
      });
  });

  test("Denies deleting non-existent book", done => {
    const id = 50;
    return request(app)
      .delete(route(id))
      .set("Authorization", "Bearer my-awesome-token")
      .expect(404)
      .expect(/Book Not Found!/, done);
  });
});
