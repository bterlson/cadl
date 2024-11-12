import "@typespec/http";

using Http;

@service({
  title: "Petstore",
})
@useAuth(ApiKeyAuth<ApiKeyLocation.header, "cred-key">)
@route("/pets")
namespace Petstore;

model Pet {
  @key
  id: string;
  name: string;
  favoriteToy: Toy;
}

model Toy {
  name: string;
  color: string;
}

@post op createPet(@body pet: Pet): Pet;
@get op getPet(@query id: string): Pet;
