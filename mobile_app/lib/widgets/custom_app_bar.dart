import 'package:flutter/material.dart';
import 'branded_logo.dart';

class CustomAppBar extends StatelessWidget implements PreferredSizeWidget {
  final String title;
  final List<Widget>? actions;
  final bool automaticallyImplyLeading;
  final bool showLogo;

  const CustomAppBar({
    super.key,
    required this.title,
    this.actions,
    this.automaticallyImplyLeading = true,
    this.showLogo = false,
  });

  @override
  Widget build(BuildContext context) {
    return AppBar(
      title: showLogo 
          ? Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                const BrandedLogo(size: 32, showShadow: false),
                const SizedBox(width: 12),
                Text(title),
              ],
            )
          : Text(title),
      automaticallyImplyLeading: automaticallyImplyLeading,
      actions: actions,
    );
  }

  @override
  Size get preferredSize => const Size.fromHeight(kToolbarHeight);
}

