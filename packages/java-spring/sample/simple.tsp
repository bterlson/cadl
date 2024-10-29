import "@typespec/http";
using TypeSpec.Http;

@service
namespace DemoService;

@route("/people")
namespace People {
  model Person {
    id: int32;
    name: string;
    age: int32;
  }

  @error
  model CustomError {
    @statusCode _: 400;
    code: int32;
    message: string;
  }


  @get op getPerson(@path id: int32): {
    @body body: Person;
    @header testHeader: string;
  } | NotFoundResponse | CustomError;
  @get op listPeople(): Person[] | CustomError;
  @post op createPerson(@body person: Person): CreatedResponse | CustomError;
}
