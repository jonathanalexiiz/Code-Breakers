<?php

// autoload_real.php @generated by Composer

class ComposerAutoloaderInit48fa2141b36874e6597bf25b8b2ea439
{
    private static $loader;

    public static function loadClassLoader($class)
    {
        if ('Composer\Autoload\ClassLoader' === $class) {
            require __DIR__ . '/ClassLoader.php';
        }
    }

    /**
     * @return \Composer\Autoload\ClassLoader
     */
    public static function getLoader()
    {
        if (null !== self::$loader) {
            return self::$loader;
        }

        spl_autoload_register(array('ComposerAutoloaderInit48fa2141b36874e6597bf25b8b2ea439', 'loadClassLoader'), true, true);
        self::$loader = $loader = new \Composer\Autoload\ClassLoader(\dirname(__DIR__));
        spl_autoload_unregister(array('ComposerAutoloaderInit48fa2141b36874e6597bf25b8b2ea439', 'loadClassLoader'));

        require __DIR__ . '/autoload_static.php';
        call_user_func(\Composer\Autoload\ComposerStaticInit48fa2141b36874e6597bf25b8b2ea439::getInitializer($loader));

        $loader->register(true);

        return $loader;
    }
}
