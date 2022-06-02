# Type Programming in TypeScript #

This lab will show you how advanced features of the TypeScript language can be used to make your code shorter, safer and (to a certain extent) self describing. We will take a simple problem, with an inelegant solution, and improve it over a series of iterations.

### The Problem ###

We are asked to design a web page which allows users to view a video, and switch to a backup video if they choose. A form should allow the user to choose the main and backup videos, and to alter the height and width of the video player.

The code should be written in TypeScript and not use any additional libraries beyond the DOM and Bootstrap. Types should be used to make the code as maintainable as possible.

### Iteration 1 - The Initial Solution ###

The code found in **iteration-1** meets the requirements. We have defined seprate types for the controls in the form (`VideoSettings`) and the data to be collected from the form (`FormControls`). 

There are however a number of weaknesses:

* To simplify the code our data structures come in two versions. One where all the fields are optional and one where they are not. So we have `VideoSettings` paired with `VideoSettingsOptional` and `FormControls` paired with `FormControlsOptional`. Going forward these types will need to be kept in sync manually.
* Similarly there is a `VideoBackupSettings` type used for state management. This contains a subset of the fields from `VideoSettings` - but there is nothing to ensure the names used in these types are kept consistent.
* When fetching data from the page we are relying entirely on calls to `getElementById` followed by a cast to the expected DOM type. This is ugly code which is 'stringly typed' - leaving us vulnerable to typos.

### Iteration 2 - Creating Mapped Types ###

In this iteration we make a start on removing the duplication by:

* Creating a `VideoModel` type to represent the data as it should be
* Introducing our own mapped types called `MyPartial` and `MyStringify`
* Deriving `VideoSettings` from `VideoModel` via `MyStringify`
* Deriving `VideoSettingsOptional` from `VideoSettings` via `MyPartial`
* Deriving `FormControlsOptional` from `FormControls` via `MyPartial`

### Iteration 3 - Using Built-In Mapped Types ###

Having introduced Mapped Types in the previous iteration, we now make use of the provided Utility Types where possible:

* We use the built in `Partial` type for `FormControlsOptional` and `VideoSettingsOptional`
* We use the built in `Pick` type for deriving `VideoBackupSettings` from `VideoSettings`
* We create a `VideoSelection` type, which makes use of Template Literal Types

### Iteration 4 - Strongly Typing Return Values ###

Now that the data structures have been improved we turn our attention to the unsafe and heavily duplicated calls to `getElementById`. These are eliminated as follows:

* We create a `PageElements` type. In this type the keys are the names of ids on the page and the values are the types of the elements with the corresponding ids. So for example the element with an id of *mainVideoURL* has a type of `HTMLSelectElement`.
* We create a `ResultElement` type, where the type parameter is a Literal Type extending `string`. The type is resolved via the matching entry in `PageElements` - so for example the compiler will resolve `ResultElement<"mainVideoURL">` as `HTMLSelectElement`.
* Using the above type we create a `findElementWithID` helper function. The return value from this function will be exactly the type we require, so for example we can access the `width` and `height` properties of an `HTMLIFrameElement`.

### Iteration 5 - Strongly Typing Parameters ###

The `findElementWithID` function created above is still stringly typed, in that any string value can be passed as the parameter. To fix this we:

* Create a `FieldNames` type, which resolves to a union of property names.
* Use `FieldNames<PageElements>` as the parameter type in `findElementWithID`. This means that the compiler will only accept a string which is also the name of a property in `PageElements`. Your IDE should be able to give you a list of all the permitted options.

### Iteration 6 - Basic Conditional Types ###

In this iteration we imagine there is a new requirement to log when the numerical values relating to the video player change. To achieve this we:

* Create a Conditional Type called `NumericFields` - which selects properties whose type is `number`
* Use this type to select the correct properties from `VideoModel`
* The resulting type is then mapped again using `Stringify` to create a type called `VideoDimensions`
* This `VideoDimensions` type is now used in a `logSizeChange` function

### Iteration 7 - Advanced Conditional Types ###

In this iteration we imagine that we need to fetch the elements from the web page on demand. To do this we:

* Create a type called `FetchOnDemand` which maps over an existing type and declares a **fetch** function for each property. So in the case of a property called **foobar** of type `Date` there would instead be a function called **fetchFoobar** with a type of `() => Date`
* We use this type to derive an `OnDemandControls` type from `FormControls`. This is then implemented and used in the implementation.