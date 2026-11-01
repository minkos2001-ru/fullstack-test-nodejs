import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from "class-validator";

export function AtLeastOneField(validationOptions?: ValidationOptions) {
  return function (target: Function) {
    registerDecorator({
      name: "atLeastOneField",
      target,
      propertyName: "atLeastOneField",
      ...(validationOptions && { options: validationOptions }),
      validator: {
        validate(_: unknown, args?: ValidationArguments) {
          if (!args) return false;

          const object = args.object as Record<string, unknown>;

          return Object.keys(object).some(
            (key) => object[key] !== undefined && object[key] !== null,
          );
        },
        defaultMessage() {
          return "Необходимо передать хотя бы одно поле для обновления";
        },
      },
    });
  };
}
