import { observer } from "mobx-react";
import React from "react";

import { Link, RouteComponentProps } from "react-router-dom";
import { routes } from "src/ts/config/routes";

import { getSVG } from "src/assets/svg";
import { UserModel, UserTypes } from "src/ts/models/UserModel";
import { injectStore } from "src/ts/store/injectStore";
import { isProducerUser, isReceiverUser } from "src/ts/utils/verifyUserModel";

import { UserDescription } from "src/ts/components/elements/UserDescription/UserDescription";
import { fetchUser } from "src/ts/utils/fetchUser";
import userProfileJson from "src/assets/data/userProfile.json";
import { ApplicationModel } from "src/ts/models/ApplicationModel";
import { Store } from "src/ts/store/Store";
import { Application } from "src/ts/components/elements/Application/Application";
import { colors } from "src/ts/config";
import { fetchProductByProducer } from "src/ts/utils/fetchProducts";
import { ProductModel } from "src/ts/models/ProductModel";
import { Product } from "src/ts/components/elements/Product/Product";
import { getUserType } from "src/ts/utils/getUserType";
import { Throbber } from "src/ts/components/utils";
import { Fade } from "src/ts/components/transitions/Fade";
import { asyncTimeout } from "src/ts/utils";

export type UserProps = {
    /**
     * Contains a reference to the user model that should be rendered
     */
    store: Store;
} & RouteComponentProps;

export type UserState = {
    /**
     * Specifies the id of the currently rendered user
     */
    userId: number;

    /**
     * Specifies the user to be rendered
     */
    renderedUser?: UserModel;

    /**
     * Specifies whehter the rendered user is the user themself, which means
     * we should render edit functionality etc.
     */
    isSelf: boolean;

    /**
     * Contains an array of products to be rendered if any
     */
    products?: ProductModel[];

    /**
     * Contains an array of applications to be rendered if any
     */
    applications?: ApplicationModel[];
}

/**
 * A page where the user can see their profile
 */
@observer
export class UnwrappedUserProfile extends React.Component<UserProps, UserState>{
    /**
     * Setup initial state
     */
    public state: UserState = {
        userId: this.props.store.user ? this.props.store.user.id : 0,
        isSelf: false,
        renderedUser: this.props.store.user,
    }

    /**
     * Determine if we should render a different user than self
     */
    public async componentDidMount(): Promise<void> {
        this.loadUser();
    }

    /**
     * When the component changes, determine if we should load a new user
     */
    public async componentDidUpdate(): Promise<void> {
        // tslint:disable-next-line completed-docs
        const readonlyUserId = (this.props.match.params as { userId: string }).userId;
        
        if (readonlyUserId && Number(readonlyUserId) !== this.state.userId) {
            this.loadUser(); 
        } else if (!readonlyUserId && this.props.store.user && this.props.store.user.id !== Number(this.state.userId)) {
            this.loadUser();
        }
    }

    /**
     * Main render method, used to render ProfilePage
     */
    // tslint:disable-next-line max-func-body-length
    public render() : JSX.Element{
        const { renderedUser: user } = this.state;

        if (!user) {
            return <h1>There's no user available to be rendered!</h1>;
        }

        return (
            <div className="page">
                <div className="wrapper">
                    <div className="profile__information">
                        <div className="header">
                            <h1>{userProfileJson.profile}</h1>
                            {this.state.isSelf && (
                                <Link className="link editProfile" to={routes.editProfile.path} title="Edit profile">
                                    <i>
                                        {getSVG("edit")}
                                    </i>
                                </Link>
                            )}
                        </div>
                        {/* Information box */}
                        <UserDescription user={user} isSelf={this.state.isSelf} />
                    </div>
                    {/* List of the user's products/applications */}
                    <div className="list">
                        {isProducerUser(user) && (
                            <>
                                <div className="list__header">
                                    <h2>{this.state.isSelf ? userProfileJson.ownProducts : userProfileJson.othersProducts}</h2>
                                    {this.state.isSelf && (
                                        <Link className="link newProduct" to={routes.createProduct.path} title="Create new product">
                                            <i>
                                                {getSVG("plus-square")}
                                            </i>
                                        </Link>
                                    )}
                                </div>
                                { this.renderProducts() }
                            </>
                        )}
                        {isReceiverUser(user) && (
                            <>
                                <h2>{this.state.isSelf ? userProfileJson.ownApplications : userProfileJson.othersApplications}</h2>
                                { this.renderApplications() }
                            </>
                            
                        )}
                    </div>
                </div>

                <style jsx>{`
                    .page {
                        margin-bottom: 15px;
                        padding: 0 10px;
                    }

                    .wrapper {
                        display: flex;
                        justify-content: space-evenly;
                    }

                    .profile__information {
                        position: sticky;
                        top: 0;
                        height: min-content;

                        & :global(.information) {
                            max-height: calc(100vh - 120px);
                            overflow: auto;
                        }
                    }

                    h1 {
                        margin-top: 25px;
                        display: inline-block;
                    }

                    p {
                        margin: 15px 0;
                    }

                    h2 {
                        margin: 0;
                    }

                    /* Link to edit profile page, centered under image */
                    :global(.link) {
                        color: ${colors.primary};
                        text-decoration: none;
                        display: inline-block;
                    }

                    :global(.editProfile) {
                        margin-top: 30px;
                        margin-left: 10px;

                        & i {
                            display: block;
                            width: 24px;
                            height: 24px;
                        }
                    }

                    :global(.newProduct > i) {
                        display: block;
                        width: 24px;
                        height: 24px;
                    }

                    :global(.link):hover {
                        color: ${colors.secondary};
                    }

                    .link i {
                        & :global(> span > svg) {
                            width: 24px;
                            margin-left: 5px;
                            /* Allign with h1 */
                            margin-bottom: -2px;
                        }
                    } 

                    /**
                     * List of user's products/applications,
                     * move down to align with information box
                     */
                    .list {
                        position: relative;
                        margin-top: 80px;
                        width: 50%;
                    }

                    .list__header {
                        display: flex;
                        align-items: center;
                        margin-bottom: 15px;

                        & h2 {
                            margin-right: 10px;
                        }
                    }

                    /* Make more room for applications/products when the width is less than 820px */
                    @media only screen and (max-width: 820px) {
                        .information {
                            max-width: 300px;
                        }
                    }

                    /* For mobile phones */
                    @media only screen and (max-width: 690px) {
                        .page {
                            width: 100%;
                            margin: auto;
                            padding: 0;
                        }

                        /* Make products/applications appear beneath information */
						.wrapper {
                            width: 100%;
    						flex-direction: column;
                            justify-content: center;

						}

                        .header {
                            text-align: center;
                        }

                        .list__header {
                            margin-top: 20px;
                        }

                        .profile__information {
                            position: static;
                            margin: 0 10px;

                            & :global(.information) {
                                max-height: unset;
                            }
                        }

                        /* Make the list wide enough to fill the  screen. */
                        .list {
                            width: calc(100% - 20px);
                            padding: 10px;
                            margin: 0;
                        }
					}
                `}</style>
            </div>
        )
    }

    /**
     * Simple helper that displays a throbber that can be rendered while products/
     * applications are loading
     */
    private renderListThrobber = () => {
        const throbberSize = 64;

        return (
            <i
                style={{
                    height: throbberSize,
                    width: throbberSize,
                }}
            >
                <Throbber size={throbberSize} relative={true} />

                <style jsx>{`
                    i {
                        position: absolute;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                    }
                `}</style>
            </i>
        );
    }

    /**
     * Internal render method that'll render all products associated to a user
     */
    private renderProducts = () => {
        return (
            <>
                <Fade in={!this.state.products} key="throbber">
                    {this.renderListThrobber()}
                </Fade>
                <Fade in={!!this.state.products} key="products">
                    <div>
                        { this.state.products && this.state.products.map((product, index) => {
                            const isOnProducersPage = product.producerId === this.state.userId;
                            const isOwnProduct = this.props.store.user 
                                ? this.props.store.user.id === product.producerId
                                : false;

                            const updateProduct = this.updateProduct.bind(this, index);

                            return (
                                <Product
                                    key={index}
                                    product={product}
                                    isOnProducersPage={isOnProducersPage}
                                    isOwnProduct={isOwnProduct}
                                    updateProduct={updateProduct}
                                    userType={getUserType(this.props.store.user, UserTypes.PRODUCER)}
                                />  
                            );
                        })}
                    </div>
                </Fade>
            </>
        );
    }

    /**
     * Internal helper that'll load all products related to a user
     */
    private loadProducts = async() => {
        if (!this.state.userId) {
            return;
        }

        const products = await fetchProductByProducer(this.state.userId, this.props.store);

        if (!products) {
            this.setState({ products: [] });
        } else {
            this.setState({ products });

        }
    }

    /**
     * Simple callback that should be executed once a product should be updated.
     * (e.g. when toggling the product on and off)
     */
    private updateProduct = (index: number, newProduct: ProductModel) => {
        const newProductList = this.state.products;

        if (newProductList) {
            newProductList[index] = newProduct;

            this.setState({ products: newProductList });
        }
    }

    /**
     * Internal render method that'll render all applications associated to a user
     */
    private renderApplications = () => {
        if (!this.state.applications) {
            return null;
        }

        return (this.state.applications.map((application, index) => {
            return <Application 
                        key={index}
                        isOwnApplication={true}
                        userType={getUserType(this.props.store.user, UserTypes.DONOR)}
                        isOnReceiversPage={true}
                        application={application} />;
        }));
    }

    /**
     * Internal helper that'll load all applications related to a user
     */
    private loadApplications = () => {
        this.setState({ applications: this.props.store.applications });
    }

    /**
     * Internal method that'll load the user to be rendered within the application
     */
    private loadUser = async () => {
        // tslint:disable-next-line completed-docs
        const readonlyUserId = (this.props.match.params as { userId: string }).userId;
        let user: UserModel | undefined;

        // If we have a match on the route, that means we should attempt to 
        // render the given user in readonly mode
        if (readonlyUserId) {
            user = await fetchUser(readonlyUserId, this.props.store);

            this.setState({
                userId: Number(readonlyUserId),
                isSelf: false,
                renderedUser: user,
            });
        } else {
            user = this.props.store.user;

            // ... however, if we doesn't match, then we should render our own
            // user
            this.setState({ isSelf: true, renderedUser: user, userId: user ? user.id : 0 });
        }

        await asyncTimeout(0);
        
        // Begin loading the desired additional data based on the user to display
        if (user && isReceiverUser(user)) {
            this.loadApplications();
        } else if (user && isProducerUser(user)) {
            this.loadProducts();
        }

    }
}

export const UserProfile = injectStore((store) => ({store}), UnwrappedUserProfile);
