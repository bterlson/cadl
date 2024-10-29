import "@typespec/http";
using TypeSpec.Http;
@service
@useAuth(BearerAuth)
namespace DemoService {

  @error
  model CustomError {
    @statusCode _: 400;
    code: int32;
    message: string;
  }

  @route("/people")
  namespace People {
    model Person<T> {
      id: int32;
      firstName: string;
      lastName: string;
      special: T;
      pets: Pets.Pet[];
    }

    @get op getPerson(@path id: int32): {
      @body body: Person<string>;
      @header testHeader: string;
    } | NotFoundResponse | CustomError;
    @get op listPeople(): Person<string>[] | CustomError;
    @post op createPerson(@body person: Person<string>): CreatedResponse | CustomError;
  }

  @route("/pets")
  namespace Pets {
    model Pet {
      name: string | int32;
      owner?: People.Person<int32>;
    }

    op listPets(): {
     @body body: Pet[];
     @header x: string;
    } | CustomError;
  }
}
