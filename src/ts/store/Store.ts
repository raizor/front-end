import { observable } from "mobx";

import { ProductModel } from "src/ts/models/ProductModel";
import { ApplicationModel } from "src/ts/models/ApplicationModel";
import { UserModel } from "src/ts/models/UserModel";

/**
 * Specifies where the created models should fetch their data from.
 */
export enum DataProviders {
    DUMMY = "dummy",
    BACKEND = "backend",
    LOCALBACKEND = "localBackend",
}

/**
 * Specifies the arguments required to create a store.
 * The specific arguments are described both in their respective classes,
 * and in the fields within the store that they're exposed upon.
 */
// tslint:disable completed-docs
type StoreArgs = {
    applications: ApplicationModel[];
    user?: UserModel;
    products: ProductModel[];
}
// tslint:enable completed-docs

/**
 * Root data store for the application lifecycle
 *
 * This store combines all data models, allowing for easy access down the
 */
// tslint:disable completed-docs
export class Store {
    /**
     * Contains a reference to the ApplicationModel, which contains fetched data
     * about an application.
     */
    @observable
    public readonly applications: ApplicationModel[];

    /**
     * Contains a reference to the ProductModel, which contains fetched data
     * about an product.
     */
    @observable
    public readonly products: ProductModel[];

    /**
     * Contains a reference to the UserModel, which contains fetched data
     * about a user - either a producer or a receiver.
     */
    @observable
    public user?: UserModel;

    /**
     * Specifies the application has managed to fully render itself yet.
     * This is used to activate initial transitions when required (i.e. when
     * didMount changes to true).
     */
    @observable
    public didMount: boolean = false;

    constructor(initial: StoreArgs) {
        this.products = initial.products;
        this.applications = initial.applications;
        this.user = initial.user;
    }
}
