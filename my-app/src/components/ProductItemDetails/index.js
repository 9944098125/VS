import { Component } from 'react'
import Cookies from 'js-cookie'
import { Link } from 'react-router-dom'
import Loader from 'react-loader-spinner'
import { BsPlusSquare, BsDashSquare } from 'react-icons/bs'


import Header from '../Header'
import SimilarProductItem from '../SimilarProductItem'

import './index.css'

const apiStatusConstants = {
    success: 'SUCCESS',
    failure: 'FAILURE',
    inProgress: 'IN_PROGRESS',
    initial: 'INITIAL',
}

class ProductItemDetails extends Component {
    state = {
        productsData: {},
        similarProductsData: [],
        apiStatus: apiStatusConstants.initial,
        quantity: 1,
    }

    componentDidMount = () => {
        this.getAProductData()
    }

    getFormattedData = data => ({
        availability: data.availability,
        brand: data.brand,
        description: data.description,
        id: data.id,
        imageUrl: data.image_url,
        price: data.price,
        rating: data.rating,
        title: data.title,
        totalReviews: data.total_reviews,
    })

    getAProductData = async () => {
        const { match } = this.props
        const { params } = match
        const { id } = params
        this.setState({
            apiStatus: apiStatusConstants.inProgress,
        })
        const jwtToken = Cookies.get('jwt_token')
        const apiUrl = `https://apis.ccbp.in/products/${id}`
        const options = {
            headers: {
                Authorization: `Bearer ${jwtToken}`,
            },
            method: 'GET',
        }
        const response = await fetch(apiUrl, options)
        if (response.ok) {
            const fetchedData = await response.json()
            const updatedData = this.getFormattedData(fetchedData)
            const updatedSimilarProductsData = fetchedData.similar_products.map(
                similarProduct => this.getFormattedData(similarProduct),
            )
            this.setState({
                productsData: updatedData,
                similarProductsData: updatedSimilarProductsData,
                apiStatus: apiStatusConstants.success,
            })
        }
        if (response.status === 404) {
            this.setState({
                apiStatus: apiStatusConstants.failure,
            })
        }
    }

    renderLoadingView = () => {
        ; <div testid="loader">
            <Loader type="ThreeDots" color="#0b69ff" height="50" width="50" />
        </div>
    }

    renderFailureView = () => {
        ; <div className="failure">
            <img
                src="https://assets.ccbp.in/frontend/react-js/nxt-trendz-error-view-img.png"
                alt="error view"
                className="error-view"
            />
            <h1 className="failed-head">Products Not Found</h1>
            <Link to="/products">
                <button type="button" className="failure-butt">
                    Continue Shopping
                </button>
            </Link>
        </div>
    }

    onIncrementQuantity = () => {
        this.setState(prevState => ({
            quantity: prevState.quantity + 1,
        }))
    }

    onDecrementQuantity = () => {
        const { quantity } = this.state
        if (quantity > 1) {
            this.setState(prevState => ({
                quantity: prevState.quantity - 1,
            }))
        }
    }

    renderProductDetailsView = () => {
        const { productsData, quantity, similarProductsData } = this.state
        const {
            availability,
            brand,
            description,
            id,
            imageUrl,
            price,
            rating,
            totalReviews,
            title,
        } = productsData

        return (
            <div className="single-product-data">
                <div className="row">
                    <img className="product-img" src={imageUrl} alt={id} />
                    <div className="right-part">
                        <h1 className="title">{title}</h1>
                        <p className="price">Rs {price}/-</p>
                        <div className="rating-side">
                            <div className="rating-row">
                                <p className="rating">{rating}</p>
                                <img
                                    src="https://assets.ccbp.in/frontend/react-js/star-img.png"
                                    className="star-img"
                                    alt="star"
                                />
                            </div>
                            <p className="reviews">{totalReviews} Reviews</p>
                        </div>
                        <p className="desc">{description}</p>
                        <div className="availability">
                            <p className="avail-head">Available:</p>
                            <p className="avail">{availability}</p>
                        </div>
                        <div className="availability">
                            <p className="avail-head">Brand:</p>
                            <p className="avail">{brand}</p>
                        </div>
                        <hr className="hor-line" />
                        <div className="in-dec-butt">
                            <button
                                className="indec-butt"
                                onClick={this.onDecrementQuantity}
                                testid="minus"
                                type="button"
                            >
                                <BsDashSquare className="quantity-controller" />
                            </button>
                            <h1 className="quantity">{quantity}</h1>
                            <button
                                className="indec-butt"
                                onClick={this.onIncrementQuantity}
                                testid="plus"
                                type="button"
                            >
                                <BsPlusSquare className="quantity-controller" />
                            </button>
                        </div>
                        <button type="button" className="add-to-cart">
                            ADD To Cart
                        </button>
                    </div>
                </div>
                <h1 className="head-2">Similar Products</h1>
                <ul className="un-li">
                    {similarProductsData.map(eachSimilarProduct => (
                        <SimilarProductItem
                            productDetails={eachSimilarProduct}
                            key={eachSimilarProduct.id}
                        />
                    ))}
                </ul>
            </div>
        )
    }

    renderProductDetails = () => {
        const { apiStatus } = this.state

        switch (apiStatus) {
            case apiStatusConstants.success:
                return this.renderProductDetailsView()
            case apiStatusConstants.failure:
                return this.renderFailureView()
            case apiStatusConstants.inProgress:
                return this.renderLoadingView()
            default:
                return null
        }
    }

    render() {
        return (
            <>
                <Header />
                <div className="product-item">{this.renderProductDetails()}</div>
            </>
        )
    }
}

export default ProductItemDetails