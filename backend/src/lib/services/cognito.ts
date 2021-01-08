import CognitoIdentityServiceProvider from "aws-sdk/clients/cognitoidentityserviceprovider";
import logger from "./logger";

/**
 * This class serves as a wrapper to the Cognito Identity Service Provider.
 * The primary benefit of this wrapper is to make testing of other
 * classes that use Cognito easier.  Mocking AWS services in unit testing
 * is a pain because of the promise() response structure.
 */
class CognitoService {
  private cognitoIdentityServiceProvider: CognitoIdentityServiceProvider;
  private static instance: CognitoService;

  /**
   * CognitoService is a Singleton, hence private constructor
   * to prevent direct constructions calls with new operator.
   */
  private constructor() {
    this.cognitoIdentityServiceProvider = new CognitoIdentityServiceProvider();
  }

  /**
   * Controls access to the singleton instance.
   */
  static getInstance() {
    if (!CognitoService.instance) {
      CognitoService.instance = new CognitoService();
    }

    return CognitoService.instance;
  }

  async listUsers(input: CognitoIdentityServiceProvider.ListUsersRequest) {
    logger.debug("Cognito ListUsers %o", input);
    return this.cognitoIdentityServiceProvider.listUsers(input).promise();
  }
}

export default CognitoService;
