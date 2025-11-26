<?php
/**
 * PHPMailer - PHP email creation and transport class.
 * Interface for OAuth2 providers.
 */

namespace PHPMailer\PHPMailer;

/**
 * OAuthTokenProvider - Interface for OAuth2 providers
 * that provides an access token.
 */
interface OAuthTokenProvider
{
    /**
     * @return string
     */
    public function getOauth64();
}
