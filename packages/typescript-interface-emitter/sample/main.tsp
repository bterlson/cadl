import "@typespec/http";
using TypeSpec.Http;
@service
namespace DemoService {

  @route("/people")
  namespace People {
    enum PersonKind {
      adult,
      child,
      adultChild
    }

    model Person<T> {
      firstName: string | int32;
      lastName: string;
      kind: PersonKind;
      special: T;
      pets: Pets.Pet[];
    }

    op listPeople(sortBy?: string): Person<string>[];
  }  


  @route("/pets")
  namespace Pets {
    model Pet {
      name: string;
      owner?: People.Person<int32>;
    }

    op listPets(): Pet[];
  }
}